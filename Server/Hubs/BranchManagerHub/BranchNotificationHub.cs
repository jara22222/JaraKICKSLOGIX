using Microsoft.AspNetCore.SignalR;
using Server.Utilities;

namespace Server.Hubs.BranchManagerHub
{
    public class BranchNotificationHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            var branch = Context.User?.FindFirst("Branch")?.Value
                ?? Context.User?.FindFirst("branch")?.Value;
            await Groups.AddToGroupAsync(Context.ConnectionId, SignalRGroupHelper.BranchGroup(branch));

            if (Context.User?.IsInRole("SuperAdmin") == true)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, SignalRGroupHelper.SuperAdminGroup);
            }

            await base.OnConnectedAsync();
        }
    }
}
