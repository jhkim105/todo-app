package com.example.todo.controller

import com.example.todo.dto.TaskRequest
import com.example.todo.dto.TaskResponse
import com.example.todo.service.TaskService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tasks")
class TaskController(
    private val taskService: TaskService
) {
    @GetMapping
    fun getTasks(@RequestParam(required = false) categoryId: Long?): ResponseEntity<List<TaskResponse>> {
        return ResponseEntity.ok(taskService.getTasks(categoryId))
    }

    @PostMapping
    fun createTask(@RequestBody request: TaskRequest): ResponseEntity<TaskResponse> {
        val created = taskService.createTask(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @PutMapping("/{id}")
    fun updateTask(
        @PathVariable id: Long,
        @RequestBody request: TaskRequest
    ): ResponseEntity<TaskResponse> {
        val updated = taskService.updateTask(id, request)
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{id}")
    fun deleteTask(@PathVariable id: Long): ResponseEntity<Void> {
        taskService.deleteTask(id)
        return ResponseEntity.noContent().build()
    }
}
