"use client";

import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <AppLayout breadcrumbs={["Settings"]} showDetailsSidebar={false}>
      <div className="px-8 py-6">
        <div className="max-w-3xl">
          <div className="mb-6 border-neutral-900 border-b pb-5">
            <h2 className="mb-2 font-bold text-4xl text-neutral-900">
              Settings
            </h2>
            <p className="text-neutral-600 text-sm">
              Manage your account and preferences
            </p>
          </div>

          <div className="space-y-8">
            {/* Account Section */}
            <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-neutral-900 text-xl">
                <span className="material-icons">person</span>
                Account
              </h3>
              <div className="space-y-4">
                <div>
                  <Label
                    className="font-medium text-neutral-700"
                    htmlFor="name"
                  >
                    Display Name
                  </Label>
                  <Input
                    className="mt-1.5 border-neutral-300 focus:border-neutral-900"
                    id="name"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <Label
                    className="font-medium text-neutral-700"
                    htmlFor="email"
                  >
                    Email
                  </Label>
                  <Input
                    className="mt-1.5 border-neutral-300 focus:border-neutral-900"
                    id="email"
                    placeholder="your@email.com"
                    type="email"
                  />
                </div>
              </div>
            </section>

            {/* Storage Section */}
            <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-neutral-900 text-xl">
                <span className="material-icons">cloud_queue</span>
                Storage
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-700">Used</span>
                  <span className="font-semibold text-neutral-900">
                    25 GB of 100 GB
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-neutral-100">
                  <div className="h-3 w-1/4 rounded-full bg-neutral-900 transition-all duration-500" />
                </div>
                <Button className="mt-4 w-full gap-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800">
                  <span className="material-icons text-base">add</span>
                  Upgrade Storage
                </Button>
              </div>
            </section>

            {/* Security Section */}
            <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-neutral-900 text-xl">
                <span className="material-icons">lock</span>
                Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Two-Factor Authentication
                    </p>
                    <p className="text-neutral-600 text-sm">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Button
                    className="rounded-full border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                    variant="outline"
                  >
                    Enable
                  </Button>
                </div>
                <Separator className="bg-neutral-200" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Change Password
                    </p>
                    <p className="text-neutral-600 text-sm">
                      Update your password regularly
                    </p>
                  </div>
                  <Button
                    className="rounded-full border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                    variant="outline"
                  >
                    Change
                  </Button>
                </div>
              </div>
            </section>

            {/* Preferences Section */}
            <section className="rounded-xl border-2 border-neutral-900 bg-white p-6">
              <h3 className="mb-4 flex items-center gap-2 font-bold text-neutral-900 text-xl">
                <span className="material-icons">tune</span>
                Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">
                      Email Notifications
                    </p>
                    <p className="text-neutral-600 text-sm">
                      Receive updates about your files
                    </p>
                  </div>
                  <Button
                    className="rounded-full border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                    variant="outline"
                  >
                    Configure
                  </Button>
                </div>
                <Separator className="bg-neutral-200" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">Default View</p>
                    <p className="text-neutral-600 text-sm">
                      Grid or list view by default
                    </p>
                  </div>
                  <Button
                    className="rounded-full border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white"
                    variant="outline"
                  >
                    Grid
                  </Button>
                </div>
              </div>
            </section>

            {/* Save Button */}
            <div className="flex justify-end gap-3">
              <Button
                className="rounded-full border-neutral-300 text-neutral-700 hover:bg-neutral-100"
                variant="outline"
              >
                Cancel
              </Button>
              <Button className="gap-2 rounded-full bg-neutral-900 text-white hover:bg-neutral-800">
                <span className="material-icons text-base">save</span>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
