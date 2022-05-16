package com.example.server;

import com.example.server.model.JSONParam;
import com.example.server.model.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/test")
public class TestController {
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
    public Result postJSON(@RequestBody JSONParam param){
        Result result = new Result();
        result.setSuccess(true);
        result.setMessage("received message \"" + param.getMessage() + "\" , at " + param.getDate());
        return result;
    }
}
