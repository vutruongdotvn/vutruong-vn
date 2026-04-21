import { AppleHelloVietnameseEffect } from "@/components/apple-hello-effect";

export default function AboutHero() {
    return (
        <section className="animate-in fade-in duration-1000 relative">

            <div className="flex flex-col items-center justify-between gap-12 md:flex-row md:items-start">
                {/* 🌟 CỘT TRÁI: AVATAR */}
                <div className="relative shrink-0 mx-auto sm:mx-0 group perspective-1000 w-48 sm:w-56 md:w-64 lg:w-88">

                    {/* Hào quang nền đằng sau thẻ */}
                    <div className="absolute -inset-2 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-30 transition duration-700" />

                    {/* Khung thẻ Glassmorphism bo góc lớn */}
                    <div className="relative bg-white/40 border border-white/60 p-1 md:p-2 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

                        <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden">
                            {/* Ảnh Avatar (Tự động zoom nhẹ khi hover) */}
                            <img
                                src="/avatar.jpg"
                                alt="Vũ Trường"
                                className="h-full w-full aspect-[2/3] object-cover"
                            />

                            {/* Lớp phủ đen dưới đáy để làm nổi bật chữ */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                            {/* Thông tin đính kèm trên thẻ */}
                            <div className="absolute bottom-5 left-5 right-5">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="relative hidden size-2.5">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full size-2.5 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-medium text-slate-400 truncate">Web Developer & Content Writer</span>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* 🌟 CỘT PHẢI: TÊN & CÂU CHUYỆN */}
                <div className="flex-1 w-full text-center md:text-left">

                    {/* Badge Nghề nghiệp (Giữ nguyên vì đã rất đẹp) 
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 text-[0.6875rem] font-medium uppercase tracking-wider mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Web Developer & Content Creator
                    </div>
                    */}

                    {/* Lời chào */}
                    <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-tight text-slate-900 mb-6 leading-8 md:leading-11">
                        <div className="mb-6">
                            <AppleHelloVietnameseEffect className="w-44 sm:w-56 mx-auto md:mx-0 md:w-62 lg:w-72" />
                        </div>
                        <div>Mình là <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600"> Vũ Trường</span></div>
                    </h1>

                    {/* Khối Câu chuyện (Gradient Storyline) */}
                    <div className="relative space-y-3 text-[.9375rem] sm:text-base text-slate-800 leading-6 sm:leading-relaxed max-w-2xl text-justify">
                        <p>
                            Đây là dự án <strong className="font-medium">hệ sinh thái số cá nhân</strong> của mình, xây dựng những thứ mình thích
                            và chủ yếu phục vụ cho nhu cầu cá nhân của mình.
                        </p>
                        <p>
                            Bắt đầu tập tành thiết kế & lập trình từ những năm 2014 - 2015, khi mà mọi thứ vẫn còn sơ khai,
                            chưa được phát triển mạnh mẽ như bây giờ - nơi mà AI chưa có chỗ đứng, HTML, CSS và Javascript thuần
                            chiếm giá trị quan trọng trong việc thiết kế & lập trình web.
                        </p>
                        <p>
                            Đến thời điểm hiện tại 2025 - 2026, mọi thứ đã dần "dễ thở" hơn từ khi AI xuất hiện, khiến cho việc thiết kế & lập trình web
                            cũng trở nên nhẹ nhàng và dễ dàng hơn, nhiều khái niệm như <span className="font-medium">"vibe coding"</span> ra đời, tất nhiên mình cũng không đứng ngoài cuộc chơi này.
                        </p>
                        <p>
                            Đam mê xây dựng những sản phẩm công nghệ tinh tế, tối ưu và mang lại giá trị thực tế.
                            Yêu thích sự hoàn hảo trong UI/UX và luôn tìm tòi những công nghệ mới nhất.
                        </p>
                        <p>
                            <strong className="font-medium text-slate-900">VT Zone</strong> (vutruong.vn) cũng là một sản phẩm được kết hợp giữa code truyền thống và vibe coding,
                            ra mắt vào khoảng tháng 3/2026 và đang dần được hoàn thiện qua từng ngày.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}