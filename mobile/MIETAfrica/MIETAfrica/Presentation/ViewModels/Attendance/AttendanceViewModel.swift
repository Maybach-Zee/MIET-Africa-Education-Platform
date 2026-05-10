import Foundation

@Observable
final class AttendanceViewModel {
    var records: [AttendanceRecordEntity] = []
    var isLoading: Bool = false
    var showError: Bool = false
    var errorMessage: String? = nil

    private let recordAttendanceUseCase: RecordAttendanceUseCase

    init(recordAttendanceUseCase: RecordAttendanceUseCase = DIContainer.shared.makeRecordAttendanceUseCase()) {
        self.recordAttendanceUseCase = recordAttendanceUseCase
    }

    func fetchRecords() async {
        isLoading = true
        defer { isLoading = false }

        do {
            records = try await recordAttendanceUseCase.fetchAll()
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }

    func record(learnerId: String, courseId: String, isPresent: Bool) async {
        do {
            let record = try await recordAttendanceUseCase.execute(
                learnerId: learnerId,
                courseId: courseId,
                isPresent: isPresent
            )
            records.append(record)
        } catch {
            errorMessage = error.localizedDescription
            showError = true
        }
    }
}
