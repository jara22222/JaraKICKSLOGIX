using Microsoft.AspNetCore.SignalR;

namespace Server.Utilities
{
    public static class SignalRGroupHelper
    {
        public const string SuperAdminGroup = "role:superadmin";

        public static string BranchGroup(string? branch)
        {
            var normalized = string.IsNullOrWhiteSpace(branch)
                ? "unassigned"
                : branch.Trim().ToLowerInvariant();
            return $"branch:{normalized}";
        }

        public static Task SendToBranchAndSuperAdminAsync<THub>(
            this IHubContext<THub> hubContext,
            string? branch,
            string method,
            object? payload) where THub : Hub
        {
            var targets = new[]
            {
                hubContext.Clients.Group(BranchGroup(branch)).SendAsync(method, payload),
                hubContext.Clients.Group(SuperAdminGroup).SendAsync(method, payload)
            };

            return Task.WhenAll(targets);
        }

        public static Task SendToSuperAdminAsync<THub>(
            this IHubContext<THub> hubContext,
            string method,
            object? payload) where THub : Hub
        {
            return hubContext.Clients.Group(SuperAdminGroup).SendAsync(method, payload);
        }
    }
}
