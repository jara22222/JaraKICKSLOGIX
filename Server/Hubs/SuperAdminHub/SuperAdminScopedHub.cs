using Microsoft.AspNetCore.SignalR;
using Server.Utilities;

namespace Server.Hubs
{
    public abstract class SuperAdminScopedHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            if (Context.User?.IsInRole("SuperAdmin") == true)
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, SignalRGroupHelper.SuperAdminGroup);
            }

            await base.OnConnectedAsync();
        }
    }
}
