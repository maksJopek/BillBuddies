package handler

import (
	"encoding/json"
	"io"
	"log"
	"sync"

	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/websocket"
	"github.com/maksJopek/BillBuddies/server/database"
)

type WebSocket struct {
	upgrader websocket.Upgrader
}

func NewWebSocket() *WebSocket {
	return &WebSocket{
		upgrader: websocket.Upgrader{
			ReadBufferSize:  4096,
			WriteBufferSize: 4096,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

type wsMessage struct {
	Type string `json:"type"`
	Id   string `json:"id"`
	Data string `json:"data,omitempty"`
}

var roomClients = make(map[string][]*websocket.Conn)
var mutex = &sync.Mutex{}

func remFromArr[T comparable](arr []T, el T) []T {
	i := -1
	for idx, c := range arr {
		if c == el {
			i = idx
			break
		}
	}
	if i == -1 {
		return arr
	}

	arr[i] = arr[len(arr)-1]
	return arr[:len(arr)-1]
}

func addClientToRoom(id string, conn *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()

	if _, exists := roomClients[id]; exists == false {
		roomClients[id] = make([]*websocket.Conn, 0)
	}

	roomClients[id] = append(roomClients[id], conn)
}
func removeClientFromRoom(id string, conn *websocket.Conn) {
	mutex.Lock()
	defer mutex.Unlock()

	if _, exists := roomClients[id]; exists == false {
		return
	}

	roomClients[id] = remFromArr(roomClients[id], conn)
	if len(roomClients[id]) == 0 {
		delete(roomClients, id)
	}
}
func removeClientFromAllRooms(conn *websocket.Conn) {
	for id := range roomClients {
		removeClientFromRoom(id, conn)
	}
}

func (ws *WebSocket) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("failed to establish websocket connection: %s\n", err)
		return
	}

	go func() {
		for {
			var (
				err error
				msg wsMessage
			)
			_, message, err := conn.ReadMessage()
			if err != nil {
				if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
					log.Println("Error reading message:", err)
				}
				break
			}

			err = json.Unmarshal(message, &msg)
			if err != nil {
				log.Println("JSON Unmarshal error:", err)
				break
			}

			switch msg.Type {
			case "listen_on_room":
				addClientToRoom(msg.Id, conn)

			case "broadcast":
				for _, client := range roomClients[msg.Id] {
					if client != conn {
						client.WriteMessage(websocket.TextMessage, []byte(msg.Data))
					}
				}
			}
		}
		removeClientFromAllRooms(conn)
	}()
}

func RoomRouter() http.Handler {
	r := chi.NewRouter()
	r.Get("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		db := r.Context().Value("db").(*database.DB)

		room, err := database.GetRoom(db, id)
		if err != nil {
			http.Error(w, http.StatusText(err.HttpCode), err.HttpCode)
		} else {
			json.NewEncoder(w).Encode(room)
		}
	})
	r.Post("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		db := r.Context().Value("db").(*database.DB)
		err := database.CreateRoom(db, id, r.Body)
		if err != nil {
			http.Error(w, http.StatusText(err.HttpCode), err.HttpCode)
		} else {
			io.WriteString(w, http.StatusText(http.StatusOK))
		}
	})
	r.Patch("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		db := r.Context().Value("db").(*database.DB)

		err := database.UpdateRoom(db, id, r.Body)
		if err != nil {
			http.Error(w, http.StatusText(err.HttpCode), err.HttpCode)
		} else {
			io.WriteString(w, http.StatusText(http.StatusOK))
		}
	})
	r.Delete("/{id}", func(w http.ResponseWriter, r *http.Request) {
		id := chi.URLParam(r, "id")
		db := r.Context().Value("db").(*database.DB)

		err := database.DeleteRoom(db, id)
		if err != nil {
			http.Error(w, http.StatusText(err.HttpCode), err.HttpCode)
		} else {
			io.WriteString(w, http.StatusText(http.StatusOK))
		}
	})
	return r
}
