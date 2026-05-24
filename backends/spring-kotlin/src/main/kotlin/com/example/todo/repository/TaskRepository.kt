package com.example.todo.repository

import com.example.todo.model.Task
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.stereotype.Repository

@Repository
interface TaskRepository : JpaRepository<Task, Long> {
    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.category WHERE (:categoryId IS NULL OR t.category.id = :categoryId)")
    fun findAllByCategoryId(@Param("categoryId") categoryId: Long?): List<Task>
}
