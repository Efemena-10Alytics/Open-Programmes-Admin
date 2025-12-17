"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import formatCurrency from "@automattic/format-currency";
import { Activity, CreditCard, Currency, Users, Clock } from "lucide-react";

export function PaymentStats({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <Currency className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats.totalRevenue, "USD")}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Full Payments</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.revenueByType?.find(
              (t: any) => t.paymentPlan === "FULL_PAYMENT"
            )?.count || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(
              stats.revenueByType?.find(
                (t: any) => t.paymentPlan === "FULL_PAYMENT"
              )?.revenue || 0,
              "USD"
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Two Installments
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.revenueByType?.find(
              (t: any) => t.paymentPlan === "FIRST_HALF_COMPLETE"
            )?.count || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(
              stats.revenueByType?.find(
                (t: any) => t.paymentPlan === "FIRST_HALF_COMPLETE"
              )?.revenue || 0,
              "USD"
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Three Installments
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.revenueByType?.find(
              (t: any) => t.paymentPlan === "THREE_INSTALLMENTS"
            )?.count || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(
              stats.revenueByType?.find(
                (t: any) => t.paymentPlan === "THREE_INSTALLMENTS"
              )?.revenue || 0,
              "USD"
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Four Installments
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.revenueByType?.find(
              (t: any) => t.paymentPlan === "FOUR_INSTALLMENTS"
            )?.count || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(
              stats.revenueByType?.find(
                (t: any) => t.paymentPlan === "FOUR_INSTALLMENTS"
              )?.revenue || 0,
              "USD"
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
