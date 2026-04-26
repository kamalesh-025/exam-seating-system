package com.rit.examseating.service;
 
import com.rit.examseating.entity.Room;
import com.rit.examseating.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
 
@Service
@RequiredArgsConstructor
public class RoomService {
 
    private final RoomRepository roomRepository;
 
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }
 
    public List<Room> getAvailableRooms() {
        return roomRepository.findByIsAvailableTrue();
    }
 
    public Room toggleRoomAvailability(Long roomId) {
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found"));
        room.setAvailable(!room.isAvailable());
        return roomRepository.save(room);
    }
 
    public List<Room> getRoomsByBlock(Long blockId) {
        return roomRepository.findByBlockId(blockId);
    }
}