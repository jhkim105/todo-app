package com.example.todo.model

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(name = "tasks")
class Task(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false)
    var title: String = "",

    @Column(columnDefinition = "TEXT")
    var description: String? = null,

    @Column(nullable = false)
    var completed: Boolean = false,

    @Column(name = "due_date")
    var dueDate: OffsetDateTime? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var priority: Priority = Priority.MEDIUM,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    var category: Category? = null
)
