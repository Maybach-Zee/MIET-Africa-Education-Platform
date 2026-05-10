import Foundation
import SwiftData

/// Manual DI container. All dependencies are resolved here and injected at call sites.
/// Use `DIContainer.shared` as the single source of truth for the app's object graph.
final class DIContainer {
    static let shared = DIContainer()

    // MARK: Switch to false when API is ready
    static let useMocks: Bool = true

    private init() {}

    // MARK: - Networking

    private lazy var apiClient: APIClient = APIClient()

    // MARK: - Security

    let keychainService: KeychainService = KeychainService()

    // MARK: - Repositories

    lazy var authRepository: any AuthRepositoryProtocol = {
        if DIContainer.useMocks {
            return MockAuthRepository(keychainService: keychainService)
        }
        return AuthRepository(apiClient: apiClient, keychainService: keychainService)
    }()

    lazy var coursesRepository: any CoursesRepositoryProtocol = {
        if DIContainer.useMocks {
            return MockCoursesRepository()
        }
        return CoursesRepository(apiClient: apiClient, modelContext: SwiftDataStack.shared.mainContext)
    }()

    lazy var attendanceRepository: any AttendanceRepositoryProtocol = {
        if DIContainer.useMocks {
            return MockAttendanceRepository()
        }
        return AttendanceRepository(apiClient: apiClient, modelContext: SwiftDataStack.shared.mainContext)
    }()

    lazy var learnersRepository: any LearnersRepositoryProtocol = {
        if DIContainer.useMocks {
            return MockLearnersRepository()
        }
        return LearnersRepository(apiClient: apiClient, modelContext: SwiftDataStack.shared.mainContext)
    }()

    lazy var alertsRepository: any AlertsRepositoryProtocol = {
        if DIContainer.useMocks {
            return MockAlertsRepository()
        }
        return AlertsRepository(apiClient: apiClient, modelContext: SwiftDataStack.shared.mainContext)
    }()

    // MARK: - Use Case Factories

    func makeLoginUseCase() -> LoginUseCase { LoginUseCase(repository: authRepository) }
    func makeLogoutUseCase() -> LogoutUseCase { LogoutUseCase(repository: authRepository) }
    func makeFetchCoursesUseCase() -> FetchCoursesUseCase { FetchCoursesUseCase(repository: coursesRepository) }
    func makeRecordAttendanceUseCase() -> RecordAttendanceUseCase { RecordAttendanceUseCase(repository: attendanceRepository) }
    func makeFetchAttendanceUseCase() -> FetchAttendanceUseCase { FetchAttendanceUseCase(repository: attendanceRepository) }
    func makeFetchLearnersUseCase() -> FetchLearnersUseCase { FetchLearnersUseCase(repository: learnersRepository) }
    func makeFetchAlertsUseCase() -> FetchAlertsUseCase { FetchAlertsUseCase(repository: alertsRepository) }

    // MARK: - Coordinator Factories

    func makeAppCoordinator() -> AppCoordinator { AppCoordinator(container: self) }
    func makeLoginCoordinator(appCoordinator: AppCoordinator) -> LoginCoordinator {
        LoginCoordinator(appCoordinator: appCoordinator, container: self)
    }
    func makeCoursesCoordinator() -> CoursesCoordinator { CoursesCoordinator(container: self) }
    func makeAttendanceCoordinator() -> AttendanceCoordinator { AttendanceCoordinator(container: self) }
    func makeLearnersCoordinator() -> LearnersCoordinator { LearnersCoordinator(container: self) }
    func makeAlertsCoordinator() -> AlertsCoordinator { AlertsCoordinator(container: self) }
}
