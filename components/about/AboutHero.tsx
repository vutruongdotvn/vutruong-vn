import { AppleHelloVietnameseEffect } from "@/components/apple-hello-effect";
export const revalidate = 3600;
export default function AboutHero() {
    return (
        <section className="animate-in fade-in duration-1000 relative">

            <div className="flex flex-col items-center justify-between gap-10 md:flex-row md:items-start">

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
                    <h1 className="text-xl sm:text-2xl md:text-3xl tracking-tight text-slate-900 mb-6 leading-8 md:leading-11">
                        <div className="mb-6">
                            <AppleHelloVietnameseEffect className="w-44 sm:w-56 mx-auto md:mx-0 md:w-62 lg:w-72" />
                        </div>
                        <div>Mình là <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-indigo-500 to-purple-600"> Vũ Trường</span></div>
                    </h1>

                    {/* Khối Câu chuyện (Gradient Storyline) */}
                    <div className="relative space-y-3 text-[.9375rem] sm:text-base text-slate-800 leading-6 sm:leading-relaxed text-justify sm:text-left">
                        <p>
                            <b>VT Zone</b> là dự án <strong className="font-medium">hệ sinh thái số cá nhân</strong> của mình,
                            xây dựng những thứ mình thích và chủ yếu phục vụ cho nhu cầu cá nhân của mình.
                        </p>
                        <p>
                            Đam mê xây dựng những sản phẩm công nghệ tinh tế, tối ưu và mang lại giá trị thực tế. <br />
                            Yêu thích sự hoàn hảo trong UX/UI và luôn tìm tòi những công nghệ mới nhất.
                        </p>

                    </div>
                </div>
            </div>
        </section>
    );
}