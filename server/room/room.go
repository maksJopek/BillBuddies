package room

import (
	"bytes"
	"sync"

	"github.com/google/uuid"
)

type peer struct {
	id       int
	messages chan []byte
}

type room struct {
	mutex      sync.Mutex
	nextPeerId int
	peers      map[int]peer
}

func (r *room) addPeer() peer {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	id := r.nextPeerId
	peer := peer{id, make(chan []byte)}
	r.nextPeerId += 1
	r.peers[id] = peer
	return peer
}

func (r *room) removePeer(id int) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	close(r.peers[id].messages)
	delete(r.peers, id)
}

func (r *room) sendMessage(senderId int, b []byte) {
	r.mutex.Lock()
	defer r.mutex.Unlock()
	for peerId, peer := range r.peers {
		if peerId != senderId {
			peer.messages <- bytes.Clone(b)
		}
	}
}

type Manager struct {
	mutex sync.Mutex
	rooms map[uuid.UUID]*room
}

func NewManager() *Manager {
	return &Manager{
		mutex: sync.Mutex{},
		rooms: make(map[uuid.UUID]*room),
	}
}

func (m *Manager) JoinRoom(id uuid.UUID) Session {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	if _, ok := m.rooms[id]; !ok {
		m.rooms[id] = &room{
			mutex:      sync.Mutex{},
			nextPeerId: 1,
			peers:      make(map[int]peer),
		}
	}
	room := m.rooms[id]
	peer := room.addPeer()
	return Session{
		manager:      m,
		roomId:       id,
		room:         room,
		peerId:       peer.id,
		peerMessages: peer.messages,
	}
}

func (m *Manager) leaveRoom(id uuid.UUID, peerId int) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	m.rooms[id].removePeer(peerId)
	if len(m.rooms[id].peers) == 0 {
		delete(m.rooms, id)
	}
}

func (m *Manager) Close() {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	for _, r := range m.rooms {
		r.mutex.Lock()
		for _, p := range r.peers {
			close(p.messages)
		}
		r.mutex.Unlock()
	}
}

type Session struct {
	manager      *Manager
	roomId       uuid.UUID
	room         *room
	peerId       int
	peerMessages chan []byte
}

func (s *Session) SendMessage(b []byte) {
	s.room.sendMessage(s.peerId, b)
}

func (s *Session) RecvMessage() []byte {
	return <-s.peerMessages
}

func (s *Session) LeaveRoom() {
	s.manager.leaveRoom(s.roomId, s.peerId)
}
