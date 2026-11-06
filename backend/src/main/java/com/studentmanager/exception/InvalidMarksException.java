package com.studentmanager.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InvalidMarksException extends RuntimeException {

    public InvalidMarksException(String message) {
        super(message);
    }

}
