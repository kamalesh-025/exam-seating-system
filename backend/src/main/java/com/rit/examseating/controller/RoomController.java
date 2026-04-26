package com.rit.examseating.controller;
 
import com.rit.examseating.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
 
    private final RoomService roomService;
 
    @GetMapping
    public ResponseEntity<?> getAllRooms() {
        return ResponseEntity.ok(roomService.getAllRooms());
    }
 
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableRooms() {
        return ResponseEntity.ok(roomService.getAvailableRooms());
    }
 
    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleRoom(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.toggleRoomAvailability(id));
    }
 
    @GetMapping("/block/{blockId}")
    public ResponseEntity<?> getRoomsByBlock(@PathVariable Long blockId) {
        return ResponseEntity.ok(roomService.getRoomsByBlock(blockId));
    }
}
 