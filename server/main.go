package main

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/maksJopek/BillBuddies/server/room"
	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "file:sqlite.db")
	if err != nil {
		fmt.Printf("failed to open database: %s\n", err)
	}
	if err = db.Ping(); err != nil {
		fmt.Printf("failed to ping database: %s\n", err)
	}
	if _, err = db.Exec(`
CREATE TABLE users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	data BLOB NOT NULL,
	created_at INTEGER NOT NULL
)
		`); err != nil {
		fmt.Printf("failed to initialize database users table: %s\n", err)
	}
	if _, err = db.Exec(`
CREATE TABLE rooms (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	data BLOB NOT NULL,
	created_at INTEGER NOT NULL
)
		`); err != nil {
		fmt.Printf("failed to initialize database rooms table: %s\n", err)
	}
	if _, err = db.Exec(`
CREATE TABLE user_rooms (
	user_id INTEGER NOT NULL,
	room_id INTEGER NOT NULL,
	data BLOB NOT NULL,
	joined_at INTEGER NOT NULL
)
		`); err != nil {
		fmt.Printf("failed to initialize database user_rooms table: %s\n", err)
	}
	m := room.NewManager()
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, World!"))
	})
	upgrader := websocket.Upgrader{
		ReadBufferSize:  4096,
		WriteBufferSize: 4096,
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}
	r.Get("/ws", func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			fmt.Printf("failed to establish websocket connection: %s\n", err)
			return
		}
		query := r.URL.Query()
		if !query.Has("id") {
			http.Error(w, "missing query parameter \"id\"", 400)
			return
		}
		roomId, err := uuid.Parse(query.Get("id"))
		if err != nil {
			http.Error(w, "query parameter \"id\" is not valid uuid", 400)
			return
		}
		sess := m.JoinRoom(roomId)
		defer sess.LeaveRoom()
		go func() {
			for {
				msg := sess.RecvMessage()
				if msg == nil {
					break
				}
				if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
					fmt.Printf("failed to write websocket message: %s\n", err)
				}
			}
		}()
		for {
			kind, msg, err := conn.ReadMessage()
			if err != nil {
				if _, ok := err.(*websocket.CloseError); !ok {
					fmt.Println("failed to read websocket message: %s\n", err)
				}
				break
			}
			if kind != websocket.TextMessage {
				break
			}
			sess.SendMessage(msg)
		}
	})
	http.ListenAndServe(":8000", r)
}
