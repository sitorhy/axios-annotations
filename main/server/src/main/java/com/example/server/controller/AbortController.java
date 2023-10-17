package com.example.server.controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController()
@RequestMapping("/heavy")
public class AbortController {

    @GetMapping("/time")
    public String heavyTask() throws InterruptedException {
        long start = System.currentTimeMillis();
        Thread.sleep(10000);
        long end = System.currentTimeMillis();
        return "Total time spent " + ((end - start) / 1000) + "s";
    }
}
