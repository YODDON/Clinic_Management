import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CalendarIcon, Loader2, Lock, Save } from "lucide-react";
import { toast } from "sonner";

import { customerPortalApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { CustomerShell } from "@/components/layout/CustomerShell";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export const Route = createFileRoute("/my/profile")({
  component: CustomerProfilePage,
  head: () => ({ meta: [{ title: "Hồ sơ cá nhân | DentalPro" }] }),
});

function CustomerProfilePage() {
  const profileQuery = useQuery({
    queryKey: ["my", "profile"],
    queryFn: customerPortalApi.getProfile,
  });

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [gender, setGender] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (!profileQuery.data) return;
    setName(profileQuery.data.name || "");
    setPhone(profileQuery.data.phone || "");
    setDateOfBirth(profileQuery.data.dob ? new Date(profileQuery.data.dob) : undefined);
    setGender(profileQuery.data.gender || "");
    setAddress(profileQuery.data.address || "");
  }, [profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: customerPortalApi.updateProfile,
    onSuccess: async () => {
      toast.success("Đã cập nhật hồ sơ");
      await profileQuery.refetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await saveMutation.mutateAsync({
      name,
      phone,
      dob: dateOfBirth ? dateOfBirth.toISOString().slice(0, 10) : null,
      gender: gender || null,
      address: address || null,
    });
  };

  return (
    <TooltipProvider>
      <CustomerShell
        pathname="/my/profile"
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin tài khoản và bệnh nhân. Email là định danh tài khoản nên không thể thay đổi."
      >
        <Card>
          <CardContent className="p-6">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Họ và tên</Label>
                  <Input id="fullName" placeholder="Nguyễn Văn A" value={name} onChange={(event) => setName(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    Email
                    <Tooltip>
                      <TooltipTrigger type="button">
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>Email là định danh tài khoản, không thể thay đổi.</TooltipContent>
                    </Tooltip>
                  </Label>
                  <Input value={profileQuery.data?.email || ""} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input id="phone" placeholder="0901234567" value={phone} onChange={(event) => setPhone(event.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label>Ngày sinh</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start font-normal", !dateOfBirth && "text-muted-foreground")}
                      >
                        <CalendarIcon className="h-4 w-4" />
                        {dateOfBirth ? dateOfBirth.toLocaleDateString("vi-VN") : "Chọn ngày sinh"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateOfBirth}
                        onSelect={setDateOfBirth}
                        captionLayout="dropdown"
                        fromYear={1925}
                        toYear={new Date().getFullYear()}
                        disabled={(day) => day > new Date() || day < new Date("1925-01-01")}
                        initialFocus
                        className="pointer-events-auto p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Giới tính</Label>
                <RadioGroup value={gender} onValueChange={setGender} className="flex flex-wrap gap-4">
                  {[
                    { value: "male", label: "Nam" },
                    { value: "female", label: "Nữ" },
                    { value: "other", label: "Khác" },
                  ].map((item) => (
                    <label
                      key={item.value}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-border px-4 py-2 transition-colors hover:bg-accent"
                    >
                      <RadioGroupItem value={item.value} />
                      <span className="text-sm">{item.label}</span>
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Địa chỉ</Label>
                <Textarea
                  id="address"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                  rows={3}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Dùng để liên hệ hoặc gửi tài liệu nếu cần.
                </p>
              </div>

              <div className="flex justify-end border-t border-border pt-4">
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </CustomerShell>
    </TooltipProvider>
  );
}
