package com.example.todo.controller

import com.example.todo.dto.CategoryResponse
import com.example.todo.dto.TaskRequest
import com.example.todo.dto.TaskResponse
import com.example.todo.model.Priority
import com.example.todo.service.TaskService
import com.fasterxml.jackson.databind.ObjectMapper
import org.junit.jupiter.api.Test
import org.mockito.BDDMockito.given
import org.mockito.BDDMockito.willDoNothing
import org.mockito.kotlin.any
import org.mockito.kotlin.anyOrNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.restdocs.AutoConfigureRestDocs
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
import org.springframework.http.MediaType
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.delete
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post
import org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put
import org.springframework.restdocs.payload.JsonFieldType
import org.springframework.restdocs.payload.PayloadDocumentation.fieldWithPath
import org.springframework.restdocs.payload.PayloadDocumentation.requestFields
import org.springframework.restdocs.payload.PayloadDocumentation.responseFields
import org.springframework.restdocs.request.RequestDocumentation.parameterWithName
import org.springframework.restdocs.request.RequestDocumentation.pathParameters
import org.springframework.restdocs.request.RequestDocumentation.queryParameters
import org.springframework.test.context.bean.override.mockito.MockitoBean
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import com.epages.restdocs.apispec.MockMvcRestDocumentationWrapper.document
import java.time.OffsetDateTime

@WebMvcTest(TaskController::class)
@AutoConfigureRestDocs(uriScheme = "http", uriHost = "localhost", uriPort = 8080)
class TaskApiTests {

    @Autowired
    private lateinit var mockMvc: MockMvc

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @MockitoBean
    private lateinit var taskService: TaskService

    @Test
    fun getTasksTest() {
        val category = CategoryResponse(1L, "Work", "#FF5733")
        val responses = listOf(
            TaskResponse(
                id = 1L,
                title = "Submit Report",
                description = "Quarterly financial report",
                completed = false,
                dueDate = OffsetDateTime.parse("2026-05-31T23:59:59+09:00"),
                priority = Priority.HIGH,
                category = category
            )
        )
        given(taskService.getTasks(1L)).willReturn(responses)

        mockMvc.perform(
            get("/api/tasks")
                .param("categoryId", "1")
                .accept(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.size()").value(1))
            .andExpect(jsonPath("$[0].title").value("Submit Report"))
            .andDo(
                document(
                    "get-tasks",
                    description = "Get task list",
                    snippets = arrayOf(
                        queryParameters(
                            parameterWithName("categoryId").description("Filter by category ID (Optional)").optional()
                        ),
                        responseFields(
                            fieldWithPath("[].id").type(JsonFieldType.NUMBER).description("Task ID"),
                            fieldWithPath("[].title").type(JsonFieldType.STRING).description("Task Title"),
                            fieldWithPath("[].description").type(JsonFieldType.STRING).description("Task Description").optional(),
                            fieldWithPath("[].completed").type(JsonFieldType.BOOLEAN).description("Completion Status"),
                            fieldWithPath("[].dueDate").type(JsonFieldType.STRING).description("Due Date (ISO-8601)").optional(),
                            fieldWithPath("[].priority").type(JsonFieldType.STRING).description("Priority (LOW, MEDIUM, HIGH)"),
                            fieldWithPath("[].category").type(JsonFieldType.OBJECT).description("Associated Category").optional(),
                            fieldWithPath("[].category.id").type(JsonFieldType.NUMBER).description("Category ID"),
                            fieldWithPath("[].category.name").type(JsonFieldType.STRING).description("Category Name"),
                            fieldWithPath("[].category.color").type(JsonFieldType.STRING).description("Category Color")
                        )
                    )
                )
            )
    }

    @Test
    fun createTaskTest() {
        val request = TaskRequest(
            title = "Buy Milk",
            description = "Go to grocery store",
            completed = false,
            dueDate = OffsetDateTime.parse("2026-05-25T18:00:00+09:00"),
            priority = Priority.LOW,
            categoryId = 1L
        )
        val category = CategoryResponse(1L, "Work", "#FF5733")
        val response = TaskResponse(
            id = 2L,
            title = "Buy Milk",
            description = "Go to grocery store",
            completed = false,
            dueDate = OffsetDateTime.parse("2026-05-25T18:00:00+09:00"),
            priority = Priority.LOW,
            category = category
        )
        given(taskService.createTask(any())).willReturn(response)

        mockMvc.perform(
            post("/api/tasks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .accept(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(2L))
            .andDo(
                document(
                    "create-task",
                    description = "Create a new task",
                    snippets = arrayOf(
                        requestFields(
                            fieldWithPath("title").type(JsonFieldType.STRING).description("Task Title"),
                            fieldWithPath("description").type(JsonFieldType.STRING).description("Task Description").optional(),
                            fieldWithPath("completed").type(JsonFieldType.BOOLEAN).description("Completion Status"),
                            fieldWithPath("dueDate").type(JsonFieldType.STRING).description("Due Date (ISO-8601)").optional(),
                            fieldWithPath("priority").type(JsonFieldType.STRING).description("Priority (LOW, MEDIUM, HIGH)"),
                            fieldWithPath("categoryId").type(JsonFieldType.NUMBER).description("Category ID").optional()
                        ),
                        responseFields(
                            fieldWithPath("id").type(JsonFieldType.NUMBER).description("Task ID"),
                            fieldWithPath("title").type(JsonFieldType.STRING).description("Task Title"),
                            fieldWithPath("description").type(JsonFieldType.STRING).description("Task Description").optional(),
                            fieldWithPath("completed").type(JsonFieldType.BOOLEAN).description("Completion Status"),
                            fieldWithPath("dueDate").type(JsonFieldType.STRING).description("Due Date (ISO-8601)").optional(),
                            fieldWithPath("priority").type(JsonFieldType.STRING).description("Priority (LOW, MEDIUM, HIGH)"),
                            fieldWithPath("category").type(JsonFieldType.OBJECT).description("Associated Category").optional(),
                            fieldWithPath("category.id").type(JsonFieldType.NUMBER).description("Category ID"),
                            fieldWithPath("category.name").type(JsonFieldType.STRING).description("Category Name"),
                            fieldWithPath("category.color").type(JsonFieldType.STRING).description("Category Color")
                        )
                    )
                )
            )
    }

    @Test
    fun updateTaskTest() {
        val taskId = 1L
        val request = TaskRequest(
            title = "Submit Report Updated",
            description = "Quarterly financial report with edits",
            completed = true,
            dueDate = OffsetDateTime.parse("2026-05-31T23:59:59+09:00"),
            priority = Priority.HIGH,
            categoryId = 1L
        )
        val category = CategoryResponse(1L, "Work", "#FF5733")
        val response = TaskResponse(
            id = taskId,
            title = "Submit Report Updated",
            description = "Quarterly financial report with edits",
            completed = true,
            dueDate = OffsetDateTime.parse("2026-05-31T23:59:59+09:00"),
            priority = Priority.HIGH,
            category = category
        )
        given(taskService.updateTask(any(), any())).willReturn(response)

        mockMvc.perform(
            put("/api/tasks/{id}", taskId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
                .accept(MediaType.APPLICATION_JSON)
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.completed").value(true))
            .andDo(
                document(
                    "update-task",
                    description = "Update existing task",
                    snippets = arrayOf(
                        pathParameters(
                            parameterWithName("id").description("Task ID to update")
                        ),
                        requestFields(
                            fieldWithPath("title").type(JsonFieldType.STRING).description("Task Title"),
                            fieldWithPath("description").type(JsonFieldType.STRING).description("Task Description").optional(),
                            fieldWithPath("completed").type(JsonFieldType.BOOLEAN).description("Completion Status"),
                            fieldWithPath("dueDate").type(JsonFieldType.STRING).description("Due Date (ISO-8601)").optional(),
                            fieldWithPath("priority").type(JsonFieldType.STRING).description("Priority (LOW, MEDIUM, HIGH)"),
                            fieldWithPath("categoryId").type(JsonFieldType.NUMBER).description("Category ID").optional()
                        ),
                        responseFields(
                            fieldWithPath("id").type(JsonFieldType.NUMBER).description("Task ID"),
                            fieldWithPath("title").type(JsonFieldType.STRING).description("Task Title"),
                            fieldWithPath("description").type(JsonFieldType.STRING).description("Task Description").optional(),
                            fieldWithPath("completed").type(JsonFieldType.BOOLEAN).description("Completion Status"),
                            fieldWithPath("dueDate").type(JsonFieldType.STRING).description("Due Date (ISO-8601)").optional(),
                            fieldWithPath("priority").type(JsonFieldType.STRING).description("Priority (LOW, MEDIUM, HIGH)"),
                            fieldWithPath("category").type(JsonFieldType.OBJECT).description("Associated Category").optional(),
                            fieldWithPath("category.id").type(JsonFieldType.NUMBER).description("Category ID"),
                            fieldWithPath("category.name").type(JsonFieldType.STRING).description("Category Name"),
                            fieldWithPath("category.color").type(JsonFieldType.STRING).description("Category Color")
                        )
                    )
                )
            )
    }

    @Test
    fun deleteTaskTest() {
        val taskId = 1L
        willDoNothing().given(taskService).deleteTask(taskId)

        mockMvc.perform(
            delete("/api/tasks/{id}", taskId)
        )
            .andExpect(status().isNoContent)
            .andDo(
                document(
                    "delete-task",
                    description = "Delete task by ID",
                    snippets = arrayOf(
                        pathParameters(
                            parameterWithName("id").description("Task ID to delete")
                        )
                    )
                )
            )
    }
}
