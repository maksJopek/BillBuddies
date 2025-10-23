package database

import (
	"database/sql"
	"fmt"

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
	if _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	data BLOB NOT NULL,
	created_at INTEGER NOT NULL
)
		`); err != nil {
		return nil, fmt.Errorf("failed to initialize database users table: %w", err)
	}
	if _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS rooms (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	data BLOB NOT NULL,
	created_at INTEGER NOT NULL
)
		`); err != nil {
		return nil, fmt.Errorf("failed to initialize database rooms table: %w", err)
	}
	if _, err = db.Exec(`
CREATE TABLE IF NOT EXISTS user_rooms (
	user_id INTEGER NOT NULL,
	room_id INTEGER NOT NULL,
	data BLOB NOT NULL,
	joined_at INTEGER NOT NULL
)
		`); err != nil {
		return nil, fmt.Errorf("failed to initialize database user_rooms table: %w", err)
	}
	return &DB{db}, nil
}

func (db *DB) Close() error {
	return db.inner.Close()
}
