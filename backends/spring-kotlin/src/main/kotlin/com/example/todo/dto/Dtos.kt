package com.example.todo.dto

import com.example.todo.model.Category
import com.example.todo.model.Priority
import com.example.todo.model.Task
import java.time.OffsetDateTime

// Category DTOs
data class CategoryRequest(
    val name: String,
    val color: String
) {
    fun toEntity(): Category = Category(name = name, color = color)
}

data class CategoryResponse(
    val id: Long,
    val name: String,
    val color: String
)

fun Category.toResponse(): CategoryResponse = CategoryResponse(
    id = id,
    name = name,
    color = color
)

// Task DTOs
data class TaskRequest(
    val title: String,
    val description: String?,
    val completed: Boolean,
    val dueDate: OffsetDateTime?,
    val priority: Priority,
    val categoryId: Long?
)

data class TaskResponse(
    val id: Long,
    val title: String,
    val description: String?,
    val completed: Boolean,
    val dueDate: OffsetDateTime?,
    val priority: Priority,
    val category: CategoryResponse?
)

fun Task.toResponse(): TaskResponse = TaskResponse(
    id = id,
    title = title,
    description = description,
    completed = completed,
    dueDate = dueDate,
    priority = priority,
    category = category?.toResponse()
)
