package com.rit.examseating.entity;
 
import jakarta.persistence.*;
import lombok.Data;
import java.util.List;
 
@Data
@Entity
@Table(name = "blocks")
public class Block {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
 
    private String blockName;
    private int totalFloors;
 
    @OneToMany(mappedBy = "block", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Room> rooms;
}