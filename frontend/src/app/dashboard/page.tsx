"use client";
import { useEffect, useState } from "react";
import api from "@/lib/axios";
import AuthHandler from "@/components/shared/AuthHandler";
import AddTopicModal from "@/components/shared/AddTopicModal";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ExternalLink, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { format } from "date-fns";

export default function Dashboard() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const router = useRouter();
    const logout = useAuthStore((state) => state.logout); // Zustand store ka function

    const handleLogout = () => {
        logout(); // Tokens clear ho jayenge
        router.push("/login"); // User login page par chala jayega
    };


    const toggleKeyword = async (postId: number, index: number) => {
        setPosts((prevPosts: any) =>
            prevPosts.map((post: any) => {
                if (post.id !== postId) return post;
                return {
                    ...post,
                    keywords: post.keywords.map((kw: any, i: number) =>
                        i === index ? { ...kw, is_done: !kw.is_done } : kw
                    ),
                };
            })
        );
        try {
            await api.patch(`/posts/${postId}/keyword?keyword_index=${index}`);

        } catch (err) {
            setPosts((prevPosts: any) =>
                prevPosts.map((post: any) => {
                    if (post.id !== postId) return post;
                    return {
                        ...post,
                        keywords: post.keywords.map((kw: any, i: number) =>
                            i === index ? { ...kw, is_done: !kw.is_done } : kw
                        ),
                    };
                })
            );
            console.error("Update failed..!");
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get("/get-posts");
            setPosts(res.data);
        } catch (err) {
            console.error("Error while getting all posts: ", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    const handleDelete = async (id: number) => {
        if (confirm("Confirm?")) {
            await api.delete(`/delete/${id}`);
            fetchHistory();
        }
    };

    return (
        <AuthHandler>
            <div className="min-h-screen bg-zinc-950 text-zinc-100 p-6">
                <div className="max-w-4xl mx-auto">

                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-bold italic">Today I Learned</h1>
                        <AddTopicModal onPostCreated={fetchHistory} />
                        <Button 
                            variant="outline" 
                            onClick={handleLogout}
                            className="border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-red-400 hover:bg-red-400/10"
                            >
                            <LogOut className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </div>

                    {loading ? <p>Loading your research...</p> : (
                        <Accordion type="single" collapsible className="space-y-4">
                            {posts.map((post: any) => (
                                <AccordionItem key={post.id} value={`item-${post.id}`} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4">

                                    <div className="flex items-center justify-between w-full">
                                        <AccordionTrigger className="hover:no-underline flex-1 text-left">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-semibold">{post.title}</span>
                                                <span className="text-xs text-zinc-500">
                                                    {format(new Date(post.created_at), "PPP p")}
                                                </span>
                                            </div>
                                        </AccordionTrigger>

                                        <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-red-500" onClick={() => handleDelete(post.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <AccordionContent className="pt-2 pb-4 border-t border-zinc-800 mt-2">
                                        <div className="space-y-4">
                                            <p className="text-zinc-400 italic">"{post.short_note}"</p>

                                            <div>
                                                <h4 className="text-sm font-bold text-blue-400 mb-2">Related Topics:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {post.related_topics.map((topic: string) => (
                                                        <span key={topic} className="bg-zinc-800 text-xs px-2 py-1 rounded border border-zinc-700">
                                                            {topic}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-bold text-blue-400 mb-2">Related Sources & Links:</h4>
                                                <ul className="space-y-1">
                                                    {post.web_links.map((link: string) => (
                                                        <li key={link}>
                                                            <a href={link} target="_blank" className="text-xs text-zinc-500 hover:text-blue-300 flex items-center gap-1">
                                                                <ExternalLink className="h-3 w-3" /> {link}
                                                            </a>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                                                    Keywords Checklist
                                                </h4>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                    {post.keywords?.map((keyword: { text: string, is_done: boolean }, index: number) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-2 rounded-md bg-zinc-800/50 border border-zinc-700/50 hover:border-blue-500/30 transition-colors group"
                                                        >
                                                            <span className="text-sm text-zinc-300 group-has-checked:text-zinc-500 group-has-checked:line-through">
                                                                {keyword.text}
                                                            </span>

                                                            <input
                                                                type="checkbox"
                                                                checked={keyword.is_done}
                                                                onChange={() => toggleKeyword(post.id, index)}
                                                                className="h-4 w-4 rounded border-zinc-600 bg-zinc-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-zinc-900"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </div>
            </div>
        </AuthHandler>
    );
}