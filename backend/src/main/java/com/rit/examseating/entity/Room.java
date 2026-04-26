package com.rit.examseating.entity;
 
import jakarta.persistence.*;
import lombok.Data;
 
@Data
@Entity
@Table(name = "rooms")
public class Room {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    @ManyToOne
    @JoinColumn(name = "block_id")
    private Block block;
 
    private int floorNumber;
    private String roomNumber;
    private int capacity = 30;
    private boolean isAvailable = true;
}