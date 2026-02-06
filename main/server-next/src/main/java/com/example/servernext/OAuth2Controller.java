package com.example.servernext;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
public class OAuth2Controller {

    public long getCurrentTime() {
        Instant now = Instant.now();
        // 获取毫秒级时间戳
        return now.toEpochMilli();
    }

    @GetMapping("/api_1")
    public String api_1() {
        return "{ \"data\": \"api_1\", \"timestamp\": " + getCurrentTime() + " }";
    }

    @GetMapping("/api_2")
    public String api_2() {
        return "{ \"data\": \"api_2\", \"timestamp\": " + getCurrentTime() + " }";
    }

    @GetMapping("/api_3")
    public String api_3() {
        return "{ \"data\": \"api_3\", \"timestamp\": " + getCurrentTime() + " }";
    }
}
