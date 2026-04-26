package com.rit.examseating.controller;
 
import com.rit.examseating.service.SeatingService;
import com.rit.examseating.service.PdfService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;
 
@RestController
@RequestMapping("/api/seating")
@RequiredArgsConstructor
public class SeatingController {
 
    private final SeatingService seatingService;
    private final PdfService pdfService;
 
    @PostMapping("/generate")
    public ResponseEntity<?> generate(@RequestBody Map<String, String> body) {
        try {
            LocalDate date = LocalDate.parse(body.get("examDate"));
            Map<String, Object> result = seatingService.generateSeating(date);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
 
    @GetMapping("/date/{examDate}")
    public ResponseEntity<?> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate examDate) {
        return ResponseEntity.ok(seatingService.getArrangementsByDate(examDate));
    }
 
    @GetMapping("/pdf/{examDate}")
    public ResponseEntity<byte[]> downloadPdf(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate examDate) {
        try {
            byte[] pdf = pdfService.generateSeatingPdf(examDate);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                "seating_" + examDate + ".pdf");
            return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}