package com.example.todo.service

import com.example.todo.dto.TaskRequest
import com.example.todo.dto.TaskResponse
import com.example.todo.dto.toResponse
import com.example.todo.model.Task
import com.example.todo.repository.CategoryRepository
import com.example.todo.repository.TaskRepository
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class TaskService(
    private val taskRepository: TaskRepository,
    private val categoryRepository: CategoryRepository
) {
    fun getTasks(categoryId: Long?): List<TaskResponse> {
        return taskRepository.findAllByCategoryId(categoryId).map { it.toResponse() }
    }

    @Transactional
    fun createTask(request: TaskRequest): TaskResponse {
        val category = request.categoryId?.let {
            categoryRepository.findByIdOrNull(it) ?: throw IllegalArgumentException("Category not found with id: $it")
        }
        val task = Task(
            title = request.title,
            description = request.description,
            completed = request.completed,
            dueDate = request.dueDate,
            priority = request.priority,
            category = category
        )
        return taskRepository.save(task).toResponse()
    }

    @Transactional
    fun updateTask(id: Long, request: TaskRequest): TaskResponse {
        val task = taskRepository.findByIdOrNull(id) ?: throw IllegalArgumentException("Task not found with id: $id")
        val category = request.categoryId?.let {
            categoryRepository.findByIdOrNull(it) ?: throw IllegalArgumentException("Category not found with id: $it")
        }

        task.title = request.title
        task.description = request.description
        task.completed = request.completed
        task.dueDate = request.dueDate
        task.priority = request.priority
        task.category = category

        return taskRepository.save(task).toResponse()
    }

    @Transactional
    fun deleteTask(id: Long) {
        taskRepository.deleteById(id)
    }
}
