package com.example.todo.controller

import com.example.todo.dto.CategoryRequest
import com.example.todo.dto.CategoryResponse
import com.example.todo.service.CategoryService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/categories")
class CategoryController(
    private val categoryService: CategoryService
) {
    @GetMapping
    fun getCategories(): ResponseEntity<List<CategoryResponse>> {
        return ResponseEntity.ok(categoryService.getAllCategories())
    }

    @PostMapping
    fun createCategory(@RequestBody request: CategoryRequest): ResponseEntity<CategoryResponse> {
        val created = categoryService.createCategory(request)
        return ResponseEntity.status(HttpStatus.CREATED).body(created)
    }

    @DeleteMapping("/{id}")
    fun deleteCategory(@PathVariable id: Long): ResponseEntity<Void> {
        categoryService.deleteCategory(id)
        return ResponseEntity.noContent().build()
    }
}
