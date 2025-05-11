package com.example.server.controller;

import com.example.server.model.SimpleRequestParam;
import com.example.server.model.SimpleResponseResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@Slf4j
@RestController
@RequestMapping("/test")
public class PublicController {
    @GetMapping("/hello")
    public String hello(@RequestParam String word, @RequestParam(required = false) String param1, @RequestParam(required = false) String param2) {
        log.info("word = " + word);
        return "hello " + word + " param1=" + param1 + " param2=" + param2;
    }

    @PostMapping("/hello")
    public String helloPost(@RequestParam String word, @RequestParam(required = false) String param1, @RequestParam(required = false) String param2) {
        return "hello " + word + " param1=" + param1 + " param2=" + param2;
    }

    @PostMapping("/message")
    public String postMessage(@RequestBody String message, @RequestParam String from) {
        log.info("message = " + message);
        return "received message \"" + message + "\" , from " + from;
    }

    @PostMapping("/json")
    public SimpleResponseResult postJSON(@RequestBody SimpleRequestParam param){
        log.info("param = " + param.message);
        SimpleResponseResult simpleResponseResult = new SimpleResponseResult();
        simpleResponseResult.setSuccess(true);
        simpleResponseResult.setMessage("received message \"" + param.getMessage() + "\" , at " + new Date());
        return simpleResponseResult;
    }
}
