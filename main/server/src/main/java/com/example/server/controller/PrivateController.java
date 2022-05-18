package com.example.server.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.SimpleDateFormat;
import java.util.Date;

@RestController
@RequestMapping("/auth")
public class PrivateController {
    private final SimpleDateFormat fmt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @GetMapping("/test")
    public String test() {
        return "success";
    }

    @GetMapping("/channel1")
    public String channel1() {
        return fmt.format(new Date());
    }

    @GetMapping("/channel2")
    public String channel2() {
        return fmt.format(new Date());
    }

    @GetMapping("/channel3")
    public String channel3() {
        return fmt.format(new Date());
    }

    @GetMapping("/channel4")
    public String channel4() {
        return fmt.format(new Date());
    }

    @GetMapping("/channel5")
    public String channel5() {
        return fmt.format(new Date());
    }
}
