from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle


OUTPUT_PATH = "C:/IT15-KICKSLOGIX/docs/Database_Tables_Schema.pdf"


TABLES = [
    {
        "name": "AspNetUsers",
        "rows": [
            ("Id (PK)", "nvarchar", "450", "User ID"),
            ("UserName", "nvarchar", "256", "Username"),
            ("Email", "nvarchar", "256", "User email"),
            ("PasswordHash", "nvarchar", "max", "Hashed password"),
            ("FirstName", "nvarchar", "20", "First name"),
            ("MiddleName", "nvarchar", "50", "Middle name"),
            ("LastName", "nvarchar", "20", "Last name"),
            ("Branch", "nvarchar", "50", "Assigned branch"),
            ("Address", "nvarchar", "50", "Address"),
            ("IsActive", "nvarchar", "max", "User state"),
            ("CreatedAt", "datetime2", "-", "Created datetime"),
            ("UpdatedAt", "datetime2", "-", "Updated datetime"),
        ],
    },
    {
        "name": "AspNetRoles",
        "rows": [
            ("Id (PK)", "nvarchar", "450", "Role ID"),
            ("Name", "nvarchar", "256", "Role name"),
            ("NormalizedName", "nvarchar", "256", "Normalized role name"),
        ],
    },
    {
        "name": "AspNetUserRoles",
        "rows": [
            ("UserId (PK, FK)", "nvarchar", "450", "Linked user ID"),
            ("RoleId (PK, FK)", "nvarchar", "450", "Linked role ID"),
        ],
    },
    {
        "name": "AspNetUserClaims",
        "rows": [
            ("Id (PK)", "int", "-", "Claim row ID"),
            ("UserId (FK)", "nvarchar", "450", "User ID"),
            ("ClaimType", "nvarchar", "max", "Claim type"),
            ("ClaimValue", "nvarchar", "max", "Claim value"),
        ],
    },
    {
        "name": "AspNetUserLogins",
        "rows": [
            ("LoginProvider (PK)", "nvarchar", "450", "External auth provider"),
            ("ProviderKey (PK)", "nvarchar", "450", "Provider user key"),
            ("ProviderDisplayName", "nvarchar", "max", "Provider display name"),
            ("UserId (FK)", "nvarchar", "450", "User ID"),
        ],
    },
    {
        "name": "AspNetUserTokens",
        "rows": [
            ("UserId (PK, FK)", "nvarchar", "450", "User ID"),
            ("LoginProvider (PK)", "nvarchar", "450", "Token provider"),
            ("Name (PK)", "nvarchar", "450", "Token name"),
            ("Value", "nvarchar", "max", "Token value"),
        ],
    },
    {
        "name": "AspNetRoleClaims",
        "rows": [
            ("Id (PK)", "int", "-", "Role claim row ID"),
            ("RoleId (FK)", "nvarchar", "450", "Role ID"),
            ("ClaimType", "nvarchar", "max", "Claim type"),
            ("ClaimValue", "nvarchar", "max", "Claim value"),
        ],
    },
    {
        "name": "DataProtectionKeys",
        "rows": [
            ("Id (PK)", "int", "-", "Key row ID"),
            ("FriendlyName", "nvarchar", "max", "Key name"),
            ("Xml", "nvarchar", "max", "Key XML payload"),
        ],
    },
    {
        "name": "AuditLogs",
        "rows": [
            ("LogId (PK)", "nvarchar", "36", "Audit log ID"),
            ("UserId", "nvarchar", "128", "User reference ID"),
            ("PerformedBy", "nvarchar", "max", "Actor display name"),
            ("Action", "nvarchar", "50", "Action type"),
            ("Description", "nvarchar", "max", "Action details"),
            ("Branch", "nvarchar", "50", "Branch scope"),
            ("DatePerformed", "datetime2", "-", "Event datetime"),
        ],
    },
    {
        "name": "BinLocation",
        "rows": [
            ("BinId (PK)", "nvarchar", "128", "Bin ID"),
            ("BinLocation", "nvarchar", "20", "Bin location code"),
            ("Branch", "nvarchar", "50", "Branch"),
            ("BinStatus", "nvarchar", "20", "Bin status"),
            ("IsAvailable", "bit", "-", "Availability flag"),
            ("BinSize", "nvarchar", "3", "Size class"),
            ("BinCapacity", "int", "-", "Max unit capacity"),
            ("OccupiedQty", "int", "-", "Current occupied quantity"),
            ("QrCodeString", "nvarchar", "500", "Bin QR content"),
            ("CreatedAt", "datetime2", "-", "Created datetime"),
            ("UpdatedAt", "datetime2", "-", "Updated datetime"),
        ],
    },
    {
        "name": "Inventory",
        "rows": [
            ("ProductId (PK)", "nvarchar", "36", "Product/batch ID"),
            ("SupplierId (FK)", "nvarchar", "450", "Supplier owner ID"),
            ("SupplierName", "nvarchar", "100", "Supplier name"),
            ("ProductName", "nvarchar", "80", "Product name"),
            ("ItemQty", "nvarchar", "max", "Quantity text"),
            ("QuantityOnHand", "int", "-", "Quantity on hand"),
            ("SKU", "nvarchar", "50", "SKU code"),
            ("Size", "nvarchar", "3", "Size"),
            ("QrString", "nvarchar", "255", "Product QR content"),
            ("CriticalThreshold", "int", "-", "Low stock threshold"),
            ("WorkflowStatus", "nvarchar", "30", "Workflow status"),
            ("Branch", "nvarchar", "80", "Branch"),
            ("BinId (FK)", "nvarchar", "128", "Assigned bin"),
            ("IsBinAssigned", "bit", "-", "Bin assigned flag"),
            ("DateReceived", "datetime2", "-", "Received datetime"),
            ("UpdatedAt", "datetime2", "-", "Updated datetime"),
        ],
    },
    {
        "name": "Orders",
        "rows": [
            ("OrderId (PK)", "nvarchar", "36", "Order ID"),
            ("Branch", "nvarchar", "50", "Branch"),
            ("CustomerName", "nvarchar", "80", "Customer name"),
            ("CustomerAddress", "nvarchar", "120", "Shipping address"),
            ("CourierId", "nvarchar", "50", "Courier reference"),
            ("Source", "nvarchar", "30", "Order source"),
            ("SKU", "nvarchar", "50", "SKU"),
            ("Size", "nvarchar", "3", "Size"),
            ("Quantity", "int", "-", "Ordered quantity"),
            ("Status", "nvarchar", "30", "Order status"),
            ("ApprovedByUserId (FK)", "nvarchar", "450", "Approver user ID"),
            ("CreatedAt", "datetime2", "-", "Created datetime"),
            ("ApprovedAt", "datetime2", "-", "Approved datetime"),
            ("UpdatedAt", "datetime2", "-", "Updated datetime"),
        ],
    },
    {
        "name": "StockMovements",
        "rows": [
            ("MovementId (PK)", "nvarchar", "36", "Movement ID"),
            ("ProductId (FK)", "nvarchar", "36", "Product ID"),
            ("OrderId (FK)", "nvarchar", "36", "Order ID"),
            ("BinId (FK)", "nvarchar", "128", "Bin ID"),
            ("Branch", "nvarchar", "50", "Branch"),
            ("Action", "nvarchar", "30", "Movement action"),
            ("FromStatus", "nvarchar", "30", "Previous status"),
            ("ToStatus", "nvarchar", "30", "Next status"),
            ("Quantity", "int", "-", "Movement quantity"),
            ("PerformedByUserId", "nvarchar", "450", "Actor user ID"),
            ("PerformedBy", "nvarchar", "80", "Actor name"),
            ("Description", "nvarchar", "255", "Movement details"),
            ("OccurredAt", "datetime2", "-", "Event datetime"),
        ],
    },
    {
        "name": "BranchNotifications",
        "rows": [
            ("NotificationId (PK)", "nvarchar", "36", "Notification ID"),
            ("Branch", "nvarchar", "50", "Branch"),
            ("RecipientUserId", "nvarchar", "450", "Recipient user ID"),
            ("Type", "nvarchar", "30", "Notification type"),
            ("Size", "nvarchar", "3", "Related size"),
            ("Message", "nvarchar", "255", "Notification message"),
            ("IsRead", "bit", "-", "Read flag"),
            ("CreatedAt", "datetime2", "-", "Created datetime"),
            ("ReadAt", "datetime2", "-", "Read datetime"),
        ],
    },
    {
        "name": "BranchPasswordResetRequests",
        "rows": [
            ("RequestId (PK)", "nvarchar", "36", "Request ID"),
            ("UserId", "nvarchar", "450", "Target user ID"),
            ("Branch", "nvarchar", "50", "Branch"),
            ("UserEmail", "nvarchar", "100", "Target email"),
            ("UserFirstName", "nvarchar", "50", "Target first name"),
            ("UserLastName", "nvarchar", "50", "Target last name"),
            ("RequestedByFirstName", "nvarchar", "50", "Requester first name"),
            ("RequestedByLastName", "nvarchar", "50", "Requester last name"),
            ("RequestedByEmail", "nvarchar", "100", "Requester email"),
            ("RequestedByAddress", "nvarchar", "120", "Requester address"),
            ("RequestedRoleName", "nvarchar", "30", "Requested role"),
            ("Status", "nvarchar", "30", "Request status"),
            ("RequestedAt", "datetime2", "-", "Requested datetime"),
            ("ReviewedAt", "datetime2", "-", "Reviewed datetime"),
            ("ResetLinkSentAt", "datetime2", "-", "Reset link sent datetime"),
            ("ResetCompletedAt", "datetime2", "-", "Reset completed datetime"),
            ("ReviewedByUserId", "nvarchar", "450", "Reviewer user ID"),
            ("ReviewedByUserName", "nvarchar", "100", "Reviewer user name"),
            ("ReviewRemarks", "nvarchar", "255", "Reviewer remarks"),
        ],
    },
]


def build_pdf() -> None:
    doc = SimpleDocTemplate(
        OUTPUT_PATH,
        pagesize=A4,
        leftMargin=24,
        rightMargin=24,
        topMargin=24,
        bottomMargin=24,
    )

    styles = getSampleStyleSheet()
    story = []
    story.append(Paragraph("KicksLogix Database Tables", styles["Title"]))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Format: Field Names | Datatype | Length | Description", styles["Italic"]))
    story.append(Spacer(1, 12))

    for table in TABLES:
        story.append(Paragraph(f"<b>{table['name']}</b>", styles["Heading3"]))
        data = [["Field Names", "Datatype", "Length", "Description"], *table["rows"]]
        tbl = Table(data, colWidths=[150, 90, 50, 250], repeatRows=1)
        tbl.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E5E7EB")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 8),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#9CA3AF")),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F9FAFB")]),
                ]
            )
        )
        story.append(tbl)
        story.append(Spacer(1, 12))

    doc.build(story)


if __name__ == "__main__":
    build_pdf()
    print(OUTPUT_PATH)
