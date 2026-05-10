import Foundation

@Observable
final class CoursesViewModel {
    var courses: [CourseEntity] = []
    var isLoading: Bool = false
    var showError: Bool = false
    var errorMessage: String? = nil

    private let fetchCoursesUseCase: FetchCoursesUseCase

    init(fetchCoursesUseCase: FetchCoursesUseCase = DIContainer.shared.makeFetchCoursesUseCase()) {
        self.fetchCoursesUseCase = fetchCoursesUseCase
    }

    func fetchCourses() async {
        isLoading = true
        defer { isLoading = false }

        do {
            courses = try await fetchCoursesUseCase.execute()
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
