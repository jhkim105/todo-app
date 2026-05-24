package com.example.todo.service

import com.example.todo.dto.CategoryRequest
import com.example.todo.dto.CategoryResponse
import com.example.todo.dto.toResponse
import com.example.todo.repository.CategoryRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class CategoryService(
    private val categoryRepository: CategoryRepository
) {
    fun getAllCategories(): List<CategoryResponse> {
        return categoryRepository.findAll().map { it.toResponse() }
    }

    @Transactional
    fun createCategory(request: CategoryRequest): CategoryResponse {
        val category = request.toEntity()
        return categoryRepository.save(category).toResponse()
    }

    @Transactional
    fun deleteCategory(id: Long) {
        categoryRepository.deleteById(id)
    }
}
