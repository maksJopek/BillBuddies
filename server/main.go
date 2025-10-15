package main

import (
	"database/sql"
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
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
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello, World!"))
	})
	http.ListenAndServe(":8000", r)
}
