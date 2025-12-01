"use client";

import Navbar from "@/components/drive/Navbar";
import Sidebar from "@/components/drive/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function SettingsPage() {
  return (
    <div className="flex h-screen flex-col bg-neutral-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl">
            <div className="mb-6 pb-5 border-b border-neutral-900">
              <h2 className="font-bold text-4xl text-neutral-900 mb-2">
                Settings
              </h2>
              <p className="text-neutral-600 text-sm">
                Manage your account and preferences
              </p>
            </div>

            <div className="space-y-8">
              {/* Account Section */}
              <section className="bg-white rounded-xl border-2 border-neutral-900 p-6">
                <h3 className="font-bold text-xl text-neutral-900 mb-4 flex items-center gap-2">
                  <span className="material-icons">person</span>
                  Account
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-neutral-700 font-medium"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      className="mt-1.5 border-neutral-300 focus:border-neutral-900"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-neutral-700 font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      className="mt-1.5 border-neutral-300 focus:border-neutral-900"
                    />
                  </div>
                </div>
              </section>

              {/* Storage Section */}
              <section className="bg-white rounded-xl border-2 border-neutral-900 p-6">
                <h3 className="font-bold text-xl text-neutral-900 mb-4 flex items-center gap-2">
                  <span className="material-icons">cloud_queue</span>
                  Storage
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-700">Used</span>
                    <span className="font-semibold text-neutral-900">
                      25 GB of 100 GB
                    </span>
                  </div>
                  <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-3 bg-neutral-900 rounded-full w-1/4 transition-all duration-500" />
                  </div>
                  <Button className="w-full bg-neutral-900 text-white hover:bg-neutral-800 rounded-full gap-2 mt-4">
                    <span className="material-icons text-base">add</span>
                    Upgrade Storage
                  </Button>
                </div>
              </section>

              {/* Security Section */}
              <section className="bg-white rounded-xl border-2 border-neutral-900 p-6">
                <h3 className="font-bold text-xl text-neutral-900 mb-4 flex items-center gap-2">
                  <span className="material-icons">lock</span>
                  Security
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">
                        Two-Factor Authentication
                      </p>
                      <p className="text-sm text-neutral-600">
                        Add an extra layer of security
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white rounded-full"
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
                      <p className="text-sm text-neutral-600">
                        Update your password regularly
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white rounded-full"
                    >
                      Change
                    </Button>
                  </div>
                </div>
              </section>

              {/* Preferences Section */}
              <section className="bg-white rounded-xl border-2 border-neutral-900 p-6">
                <h3 className="font-bold text-xl text-neutral-900 mb-4 flex items-center gap-2">
                  <span className="material-icons">tune</span>
                  Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">
                        Email Notifications
                      </p>
                      <p className="text-sm text-neutral-600">
                        Receive updates about your files
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white rounded-full"
                    >
                      Configure
                    </Button>
                  </div>
                  <Separator className="bg-neutral-200" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-neutral-900">
                        Default View
                      </p>
                      <p className="text-sm text-neutral-600">
                        Grid or list view by default
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="border-neutral-900 text-neutral-900 hover:bg-neutral-900 hover:text-white rounded-full"
                    >
                      Grid
                    </Button>
                  </div>
                </div>
              </section>

              {/* Save Button */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-full"
                >
                  Cancel
                </Button>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800 rounded-full gap-2">
                  <span className="material-icons text-base">save</span>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
