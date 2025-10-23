package handler

import (
	"errors"
	"log"
	"net"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/maksJopek/BillBuddies/server/room"
)

type WebSocket struct {
	manager  *room.Manager
	upgrader websocket.Upgrader
}

func NewWebSocket() *WebSocket {
	return &WebSocket{
		manager: room.NewManager(),
		upgrader: websocket.Upgrader{
			ReadBufferSize:  4096,
			WriteBufferSize: 4096,
			CheckOrigin: func(r *http.Request) bool {
				return true
			},
		},
	}
}

func (ws *WebSocket) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := ws.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("failed to establish websocket connection: %s\n", err)
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
	sess := ws.manager.JoinRoom(roomId)
	messages := make(chan []byte)
	go func() {
		for {
			kind, msg, err := conn.ReadMessage()
			if err != nil {
				if _, ok := err.(*websocket.CloseError); !ok {
					log.Printf("failed to read websocket message: %s\n", err)
				}
				break
			}
			if kind != websocket.TextMessage {
				break
			}
			messages <- msg
		}
		close(messages)
	}()
	go func() {
		for {
			msg := sess.RecvMessage()
			if msg == nil {
				break
			}
			if err := conn.WriteMessage(websocket.TextMessage, msg); err != nil {
				log.Printf("failed to write websocket message: %s\n", err)
			}
		}
	}()
	ctx := r.Context()
loop:
	for {
		select {
		case <-ctx.Done():
			sess.LeaveRoom()
			if err = conn.WriteMessage(
				websocket.CloseMessage,
				websocket.FormatCloseMessage(websocket.CloseGoingAway, "server is gracefully shutting down"),
			); err != nil && !errors.Is(err, net.ErrClosed) {
				log.Printf("failed to write websocket close message: %s\n", err)
			}
			break loop
		case msg := <-messages:
			if msg == nil {
				sess.LeaveRoom()
				break loop
			} else {
				sess.SendMessage(msg)
			}
		}

	}
}

func (ws *WebSocket) Close() {
	ws.manager.Close()
}
