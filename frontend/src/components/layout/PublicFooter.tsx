export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold text-foreground">DentalPro</div>
          <div>Customer portal V2 dùng chung business logic với hệ thống nội bộ V1.</div>
        </div>
        <div className="text-xs md:text-right">
          <div>© 2026 DentalPro</div>
          <div>Đặt lịch online, tiếp nhận nội bộ, điều trị và theo dõi trên cùng dữ liệu.</div>
        </div>
      </div>
    </footer>
  );
}
