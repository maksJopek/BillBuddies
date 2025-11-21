package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"time"

	_ "modernc.org/sqlite"
)

type DB struct {
	inner *sql.DB
}

func New(path string) (*DB, error) {
	db, err := sql.Open("sqlite", fmt.Sprintf("file:%s", path))
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}
	if err = db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}
	if _, err = db.Exec(`CREATE TABLE IF NOT EXISTS room (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	uuid TEXT NOT NULL UNIQUE,
	data TEXT NOT NULL,
	created_at INTEGER NOT NULL
)
		`); err != nil {
		return nil, fmt.Errorf("failed to initialize database rooms table: %w", err)
	}
	return &DB{db}, nil
}

func (db *DB) Close() error {
	return db.inner.Close()
}

type roomCrudError struct {
	HttpCode int
}

func (e *roomCrudError) Error() string {
	return ""
}

type Room struct {
	Uuid string `json:"uuid,omitempty"`
	Data string `json:"data"`
}

func CreateRoom(db *DB, roomUuid string, roomData io.ReadCloser) *roomCrudError {
	var room Room
	err := json.NewDecoder(roomData).Decode(&room)
	if err != nil || room.Data == "" || roomUuid == "" {
		return &roomCrudError{400}
	}

	_, err = db.inner.Exec("INSERT INTO room (uuid, data, created_at) VALUES (?, ?, ?)", roomUuid, room.Data, time.Now())
	if err != nil {
		return &roomCrudError{500}
	}

	return nil
}

func GetRoom(db *DB, roomUuid string) (string, *roomCrudError) {
	var data string
	err := db.inner.QueryRow("SELECT data FROM room WHERE uuid = ?", roomUuid).Scan(&data)
	if err != nil {
		return "", &roomCrudError{404}
	}

	return data, nil
}

func UpdateRoom(db *DB, roomUuid string, roomData io.ReadCloser) *roomCrudError {
	var room Room
	err := json.NewDecoder(roomData).Decode(&room)
	if err != nil || room.Data == "" || room.Uuid != "" {
		return &roomCrudError{400}
	}

	res, err := db.inner.Exec("UPDATE room SET data = ? WHERE uuid = ?", room.Data, roomUuid)
	if err != nil {
		return &roomCrudError{500}
	}
	affected, _ := res.RowsAffected()
	if affected != 1 {
		return &roomCrudError{404}
	}

	return nil
}

func DeleteRoom(db *DB, roomUuid string) *roomCrudError {
	res, err := db.inner.Exec("DELETE FROM room WHERE uuid = ?", roomUuid)
	if err != nil {
		return &roomCrudError{500}
	}
	if aff, _ := res.RowsAffected(); aff != 1 {
		return &roomCrudError{404}
	}

	return nil
}
