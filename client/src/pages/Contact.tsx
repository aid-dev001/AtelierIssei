import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { insertContactSchema, type InsertContact } from "@db/schema";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const CONTACT_EMAIL = 'isseiart2018@gmail.com';

const Contact = () => {
  const { toast } = useToast();
  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: InsertContact) =>
      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "送信完了",
        description: "お問い合わせありがとうございます。追って担当者よりご連絡させていただきます。",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "エラー",
        description: "送信に失敗しました。時間をおいて再度お試しください。",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-12 max-w-2xl mx-auto">
      <section>
        <div className="text-center py-20 bg-white">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-12 tracking-wider text-gray-800">CONTACT</h1>
            <p className="text-xl text-gray-700 leading-relaxed font-medium max-w-2xl mx-auto">
              作品のお問い合わせや展示についてのご相談は、 下記メールアドレスもしくは各種SNSまで直接ご連絡ください。
            </p>
            <div className="text-xl mt-8 space-y-2">
              <p>isseiart2018@gmail.com</p>
              <p>chatnoir710@gmail.com</p>
            </div>
          </div>
        </div>
      </section>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>お名前</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>メールアドレス</FormLabel>
                <FormControl>
                  <Input {...field} type="email" className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>お問い合わせ内容</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={6} className="bg-white" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={true}
          >
            {mutation.isPending ? "送信中..." : "送信する"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Contact;
