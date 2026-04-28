import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Phone,
  Shield,
  Sparkles,
  Stethoscope,
} from "lucide-react";

import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "@/hooks/use-session";
import { publicApi } from "@/lib/api";
import { getBookingRouteForRole, normalizeRole } from "@/lib/rbac";

export const Route = createFileRoute("/")({
  component: LandingPage,
  head: () => ({ meta: [{ title: "DentalPro | Customer Portal" }] }),
});

function LandingPage() {
  const session = useSession();
  const navigate = useNavigate();
  const role = normalizeRole(session?.user.role);
  const [activeCategory, setActiveCategory] = useState("all");
  const clinicAddress = import.meta.env.VITE_CLINIC_ADDRESS || "123 Lê Lợi, Quận 1, TP.HCM";
  const clinicHotline = import.meta.env.VITE_CLINIC_HOTLINE || "1900 1234";
  const clinicHours = import.meta.env.VITE_CLINIC_HOURS || "T2 - T7: 8:00-17:30 · CN: 8:00-12:00";
  const encodedAddress = encodeURIComponent(clinicAddress);
  const mapEmbedUrl =
    import.meta.env.VITE_GOOGLE_MAP_EMBED_URL ||
    `https://maps.google.com/maps?q=${encodedAddress}&z=17&output=embed`;
  const mapPlaceUrl =
    import.meta.env.VITE_GOOGLE_MAP_PLACE_URL ||
    `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;

  const servicesQuery = useQuery({
    queryKey: ["public", "services"],
    queryFn: () => publicApi.services(),
  });
  const dentistsQuery = useQuery({
    queryKey: ["public", "dentists"],
    queryFn: publicApi.dentists,
  });

  const services = servicesQuery.data || [];
  const dentists = dentistsQuery.data || [];
  const categories = useMemo(
    () => ["all", ...Array.from(new Set(services.map((service) => service.category).filter(Boolean)))],
    [services],
  );
  const filteredServices =
    activeCategory === "all"
      ? services
      : services.filter((service) => service.category === activeCategory);

  const bookingHref = !role ? "/register" : getBookingRouteForRole(role);

  const handleBooking = (serviceId?: string) => {
    if (!role) {
      void navigate({ to: "/register" });
      return;
    }

    if (role === "customer") {
      void navigate({
        to: "/my/appointments/new",
        search: serviceId ? { serviceId } : {},
      });
      return;
    }

    void navigate({ to: bookingHref as never });
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      <section id="hero" className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-accent via-background to-background" />
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <Badge variant="outline" className="mb-4 w-fit border-primary/30 bg-primary/5 text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Phòng khám nha khoa hàng đầu
            </Badge>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Nụ cười tự tin, <span className="text-primary">khởi đầu từ DentalPro</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-muted-foreground md:text-lg">
              Đội ngũ bác sĩ chuyên khoa, công nghệ hiện đại và quy trình chuẩn quốc tế. Customer có thể đặt lịch
              online trong vài bước, còn staff V1 tiếp nhận và xử lý trên hệ thống nội bộ.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" className="shadow-[0_14px_40px_-18px_rgba(13,148,136,0.45)]" onClick={() => handleBooking()}>
                <Calendar className="h-5 w-5" /> Đặt lịch ngay
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#services">
                  Xem dịch vụ <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6">
              {[
                { value: "15+", label: "Năm kinh nghiệm" },
                { value: "12k+", label: "Khách hàng tin chọn" },
                { value: "20+", label: "Bác sĩ chuyên khoa" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden md:block">
            <div className="absolute -right-10 -top-10 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
            <Card className="relative border-border/70 shadow-[0_18px_60px_-24px_rgba(13,148,136,0.34)]">
              <CardContent className="p-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Lý do chọn DentalPro</p>
                    <p className="font-semibold">Cam kết của chúng tôi</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { icon: Shield, title: "Vô trùng tuyệt đối", desc: "Tuân thủ chuẩn Bộ Y tế" },
                    { icon: Award, title: "Bác sĩ chuyên khoa", desc: "Kinh nghiệm điều trị thực tế" },
                    { icon: Clock, title: "Đặt lịch linh hoạt", desc: "Online 24/7, xác nhận nhanh" },
                    { icon: CheckCircle2, title: "Theo dõi rõ ràng", desc: "Dữ liệu V1 và V2 dùng chung" },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3 rounded-lg bg-secondary/60 p-3">
                      <item.icon className="mt-0.5 h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-semibold">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="services" className="border-b border-border py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary">
              Dịch vụ
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Giải pháp toàn diện cho răng miệng</h2>
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category)}
              >
                {category === "all" ? "Tất cả" : category}
              </Button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="group transition-all hover:-translate-y-1 hover:shadow-[0_18px_60px_-26px_rgba(13,148,136,0.28)]"
              >
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {service.category || "Tổng quát"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{service.durationMinutes} phút</span>
                  </div>
                  <h3 className="mb-1 text-lg font-bold group-hover:text-primary">{service.name}</h3>
                  <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">{service.description}</p>
                  <div className="flex items-center justify-end border-t border-border pt-3">
                    <Button size="sm" variant="ghost" onClick={() => handleBooking(service.id)}>
                      Đặt lịch <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="dentists" className="border-b border-border bg-secondary/30 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 text-center">
            <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary">
              Đội ngũ
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Bác sĩ tận tâm, tay nghề vững vàng</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {dentists.map((dentist) => (
              <Card
                key={dentist.id}
                className="overflow-hidden transition-all hover:shadow-[0_18px_60px_-26px_rgba(13,148,136,0.24)]"
              >
                <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/15 to-accent/40">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-background text-2xl font-bold text-primary shadow-sm">
                    {dentist.name
                      .split(" ")
                      .slice(-2)
                      .map((part) => part[0])
                      .join("")}
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-base font-bold">{dentist.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-primary">{dentist.specialization}</p>
                  <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{dentist.bio}</p>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                    <span className="text-muted-foreground">{dentist.yearsExperience} năm KN</span>
                    <span className="font-semibold text-primary">Đặt lịch tư vấn</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 md:grid-cols-2">
          <div>
            <Badge variant="outline" className="mb-3 border-primary/30 bg-primary/5 text-primary">
              Liên hệ
            </Badge>
            <h2 className="text-3xl font-bold md:text-4xl">Ghé thăm phòng khám</h2>
            <p className="mt-2 text-muted-foreground">
              Customer đặt lịch ở đây, còn điều phối, tiếp nhận, hồ sơ điều trị và hóa đơn tiếp tục được staff xử lý ở V1.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { icon: MapPin, title: "Địa chỉ", desc: clinicAddress },
                { icon: Phone, title: "Hotline", desc: clinicHotline },
                { icon: Clock, title: "Giờ làm việc", desc: clinicHours },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-7 flex gap-3">
              <Button size="lg" className="shadow-[0_14px_40px_-18px_rgba(13,148,136,0.45)]" onClick={() => handleBooking()}>
                <Calendar className="h-5 w-5" /> Đặt lịch ngay
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-muted">
            <iframe
              src={mapEmbedUrl}
              title="Bản đồ phòng khám DentalPro"
              className="min-h-[280px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <div className="border-t border-border bg-background/85 px-4 py-3">
              <a
                href={mapPlaceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                Mở trên Google Maps <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
