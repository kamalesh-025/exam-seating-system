package com.rit.examseating;

import com.rit.examseating.entity.Admin;
import com.rit.examseating.entity.Block;
import com.rit.examseating.entity.Room;
import com.rit.examseating.repository.AdminRepository;
import com.rit.examseating.repository.BlockRepository;
import com.rit.examseating.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the default admin account and the campus rooms on startup.
 * This makes the app work with an empty database (ddl-auto=update) and
 * guarantees that the documented admin credentials always log in.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String DEFAULT_USERNAME = "admin";
    private static final String DEFAULT_PASSWORD = "admin123";

    private final AdminRepository adminRepository;
    private final BlockRepository blockRepository;
    private final RoomRepository roomRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedBlocksAndRooms();
    }

    private void seedAdmin() {
        Admin admin = adminRepository.findByUsername(DEFAULT_USERNAME).orElse(null);
        if (admin == null) {
            admin = new Admin();
            admin.setUsername(DEFAULT_USERNAME);
            admin.setFullName("Exam Cell Admin");
            admin.setEmail("examcell@rit.edu");
            admin.setRole("ADMIN");
            admin.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
            adminRepository.save(admin);
            return;
        }

        // Repair the password if the stored hash does not match the default.
        try {
            if (!passwordEncoder.matches(DEFAULT_PASSWORD, admin.getPassword())) {
                admin.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
                adminRepository.save(admin);
            }
        } catch (Exception ignored) {
            admin.setPassword(passwordEncoder.encode(DEFAULT_PASSWORD));
            adminRepository.save(admin);
        }
    }

    private void seedBlocksAndRooms() {
        if (blockRepository.count() > 0 || roomRepository.count() > 0) {
            return;
        }

        Block a = saveBlock("A", 3);
        Block b = saveBlock("B", 4);
        Block c = saveBlock("C", 7);

        // Block A: floors 1-3, 5 rooms each
        for (int floor = 1; floor <= 3; floor++) {
            for (int n = 1; n <= 5; n++) {
                saveRoom(a, floor, "A" + floor + "0" + n);
            }
        }

        // Block B: floors 0-3, 5 rooms each
        for (int floor = 0; floor <= 3; floor++) {
            for (int n = 1; n <= 5; n++) {
                saveRoom(b, floor, "B" + floor + "0" + n);
            }
        }

        // Block C: floors 2-6, 7 rooms each
        for (int floor = 2; floor <= 6; floor++) {
            for (int n = 1; n <= 7; n++) {
                saveRoom(c, floor, "C" + floor + "0" + n);
            }
        }
    }

    private Block saveBlock(String name, int floors) {
        Block block = new Block();
        block.setBlockName(name);
        block.setTotalFloors(floors);
        return blockRepository.save(block);
    }

    private void saveRoom(Block block, int floor, String number) {
        Room room = new Room();
        room.setBlock(block);
        room.setFloorNumber(floor);
        room.setRoomNumber(number);
        room.setCapacity(30);
        room.setAvailable(true);
        roomRepository.save(room);
    }
}
