package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/maksJopek/BillBuddies/server/database"
	"github.com/maksJopek/BillBuddies/server/handler"
)

func run() error {
	db, err := database.New("sqlite.db")
	if err != nil {
		return err
	}
	defer db.Close()
	ws := handler.NewWebSocket()
	defer ws.Close()
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.WithValue("db", db))
	r.Mount("/room", handler.RoomRouter())
	r.Method("GET", "/ws", ws)
	server := &http.Server{
		Addr:    ":8000",
		Handler: r,
	}
	done := make(chan error, 1)
	log.Println("Server started on :8000")
	go func() {
		interrupt := make(chan os.Signal, 1)
		signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM, syscall.SIGINT)
		<-interrupt
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()
		done <- server.Shutdown(ctx)
	}()
	if err = server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		return err
	}
	return <-done
}

func main() {
	log.SetOutput(os.Stderr)
	if err := run(); err != nil {
		log.Fatalln(err)
	}
}
