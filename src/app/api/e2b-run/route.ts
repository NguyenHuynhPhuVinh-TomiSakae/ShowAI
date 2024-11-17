import { NextResponse } from 'next/server';
import { Sandbox } from '@e2b/sdk';

export async function POST(request: Request) {
    try {
        const { code, language } = await request.json();

        if (!code || !language) {
            return NextResponse.json(
                { error: 'Thiếu code hoặc ngôn ngữ lập trình' },
                { status: 400 }
            );
        }

        const sandbox = await Sandbox.create({
            template: 'base',
            apiKey: process.env.E2B_API_KEY,
        });

        let runCommand: string;
        let fileName: string;
        const workDir = '/home/user/code';

        await sandbox.process.start(`mkdir -p ${workDir}`);

        switch (language) {
            case 'python':
                fileName = `${workDir}/main.py`;
                runCommand = `cd ${workDir} && python main.py`;
                break;
            case 'javascript':
                fileName = `${workDir}/main.js`;
                runCommand = `cd ${workDir} && node main.js`;
                break;
            default:
                throw new Error('Ngôn ngữ không được hỗ trợ');
        }

        await sandbox.filesystem.write(fileName, code);

        const processInstance = await sandbox.process.start(runCommand);
        const output = await processInstance.wait();

        await sandbox.close();

        return NextResponse.json({
            output: output.stderr ? `Lỗi:\n${output.stderr}` : output.stdout
        });

    } catch (error) {
        console.error('Lỗi khi chạy code:', error);
        return NextResponse.json(
            { error: 'Có lỗi xảy ra khi chạy code' },
            { status: 500 }
        );
    }
}