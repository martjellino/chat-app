'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const Register = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            router.push("/login");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-darkBg">
            <Card className="w-full max-w-md bg-bg dark:bg-darkBg">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">
                        Create your account
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 border-2 border-border bg-accent-pink">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-purple-900 hover:underline"
                        >
                            Already have an account? Log in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}