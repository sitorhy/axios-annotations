package com.example.server.controller;

import com.example.server.model.SimpleResponseResult;
import org.springframework.web.bind.annotation.*;

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
    public SimpleResponseResult channel1(@RequestParam String marker) {
        SimpleResponseResult result = new SimpleResponseResult();
        result.setMessage(marker);
        result.setSuccess(true);
        return result;
    }

    @GetMapping("/channel2")
    public SimpleResponseResult channel2(@RequestBody String marker) {
        SimpleResponseResult result = new SimpleResponseResult();
        result.setMessage(marker);
        result.setSuccess(true);
        return result;
    }
}
