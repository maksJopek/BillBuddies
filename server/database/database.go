package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"

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
	id TEXT PRIMARY KEY,
	iv TEXT NOT NULL,
	data TEXT NOT NULL
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
	ID   string `json:"id,omitempty"`
	IV   string `json:"iv"`
	Data string `json:"data"`
}

func CreateRoom(db *DB, id string, input io.ReadCloser) *roomCrudError {
	var room Room
	err := json.NewDecoder(input).Decode(&room)
	if err != nil || room.Data == "" || id == "" {
		return &roomCrudError{400}
	}

	_, err = db.inner.Exec("INSERT INTO room (id, iv, data) VALUES (?, ?, ?)", id, room.IV, room.Data)
	if err != nil {
		return &roomCrudError{500}
	}

	return nil
}

func GetRoom(db *DB, id string) (Room, *roomCrudError) {
	var r Room
	err := db.inner.QueryRow("SELECT iv, data FROM room WHERE id = ?", id).Scan(&r.IV, &r.Data)
	if err != nil {
		return Room{}, &roomCrudError{404}
	}
	return r, nil
}

func UpdateRoom(db *DB, id string, input io.ReadCloser) *roomCrudError {
	var room Room
	err := json.NewDecoder(input).Decode(&room)
	if err != nil || room.Data == "" || room.ID != "" {
		return &roomCrudError{400}
	}

	res, err := db.inner.Exec("UPDATE room SET iv = ?, data = ? WHERE id = ?", room.IV, room.Data, id)
	if err != nil {
		return &roomCrudError{500}
	}
	affected, _ := res.RowsAffected()
	if affected != 1 {
		return &roomCrudError{404}
	}

	return nil
}

func DeleteRoom(db *DB, id string) *roomCrudError {
	res, err := db.inner.Exec("DELETE FROM room WHERE id = ?", id)
	if err != nil {
		return &roomCrudError{500}
	}
	if aff, _ := res.RowsAffected(); aff != 1 {
		return &roomCrudError{404}
	}

	return nil
}
