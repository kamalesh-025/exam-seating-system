package com.rit.examseating.repository;
 
import com.rit.examseating.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
 
public interface RoomRepository extends JpaRepository<Room, Long> {
    List<Room> findByIsAvailableTrue();
    List<Room> findByBlockId(Long blockId);
    List<Room> findByBlockIdAndFloorNumber(Long blockId, int floorNumber);
}