package com.malahot.controller;

import com.malahot.dto.response.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "健康检查")
@RestController
public class HealthController {

    @Operation(summary = "健康检查")
    @GetMapping("/health")
    public Result<String> health() {
        return Result.success("ok");
    }
}
