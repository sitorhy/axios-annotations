package com.example.server.model;

import java.util.Date;

public class SimpleRequestParam {
    public String message;
    public Date date;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }
}
