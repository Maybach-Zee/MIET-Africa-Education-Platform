import SwiftUI

struct AlertsView: View {
    @Environment(AlertsCoordinator.self) private var coordinator
    @State private var viewModel = AlertsViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if viewModel.alerts.isEmpty {
                ContentUnavailableView("No Alerts", systemImage: "bell.slash")
            } else {
                List(viewModel.alerts) { alert in
                    Button {
                        coordinator.navigateToAlertDetail(alert)
                    } label: {
                        AlertRowView(alert: alert)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .navigationTitle("Alerts")
        .task { await viewModel.fetchAlerts() }
        .refreshable { await viewModel.fetchAlerts() }
    }
}

private struct AlertRowView: View {
    let alert: AlertEntity

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack {
                Text(alert.title)
                    .font(.headline)
                Spacer()
                Text(alert.createdAt.formatted(.relative(presentation: .named)))
                    .font(.caption2)
                    .foregroundStyle(.secondary)
            }
            Text(alert.message)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
}
