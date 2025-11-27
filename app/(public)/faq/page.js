import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function FAQPage() {
  const faqs = [
    {
      question: "How do I place an order?",
      answer: "Browse our products, add items to your cart, and proceed to checkout. Fill in your shipping details and choose your payment method to complete your order."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept Cash on Delivery (COD), bKash, Nagad, and major credit/debit cards for your convenience."
    },
    {
      question: "How long does delivery take?",
      answer: "Delivery typically takes 3-5 business days within Dhaka and 5-7 business days for other areas of Bangladesh."
    },
    {
      question: "Can I return or exchange products?",
      answer: "Yes, we offer a 7-day return and exchange policy for most products. Items must be unused and in original packaging."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order is shipped, you'll receive a tracking number via email. You can also check your order status in the 'My Orders' section of your account."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely! We use industry-standard encryption to protect your personal and payment information."
    },
    {
      question: "Do you offer warranties on products?",
      answer: "Yes, many of our products come with manufacturer warranties. Warranty details are mentioned on individual product pages."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can reach us via email at support@bdshop.com, call us at +880 1234-567890, or use the contact form on our Contact Us page."
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/5">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Frequently Asked Questions
          </h1>
          <p className="text-muted-foreground mb-8">Find answers to common questions</p>

          <Card className="border-0 shadow-lg backdrop-blur-sm bg-card/80">
            <CardHeader>
              <CardTitle>Common Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
