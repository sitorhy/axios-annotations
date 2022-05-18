package com.example.server.controller;

import com.example.server.model.SimpleRequestParam;
import com.example.server.model.SimpleResponseResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/test")
public class PublicController {
    @GetMapping("/hello")
    public String hello(@RequestParam String word) {
        log.info("word = " + word);
        return "hello " + word;
    }

    @PostMapping("/message")
    public String postMessage(@RequestBody String message, @RequestParam String from) {
        log.info("message = " + message);
        return "received message \"" + message + "\" , from " + from;
    }

    @PostMapping("/json")
    public SimpleResponseResult postJSON(@RequestBody SimpleRequestParam param){
        SimpleResponseResult simpleResponseResult = new SimpleResponseResult();
        simpleResponseResult.setSuccess(true);
        simpleResponseResult.setMessage("received message \"" + param.getMessage() + "\" , at " + param.getDate());
        return simpleResponseResult;
    }
}
