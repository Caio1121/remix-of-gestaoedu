-- =============================================================
-- SEED DATA - EDUFLOW SYSTEM (V5 DEMO)
-- IDs FIXOS PARA TESTES CONSISTENTES
-- =============================================================

-- 1. EXTENSÕES NECESSÁRIAS NO SEED
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. LIMPEZA (OPCIONAL, mas útil para idempotência se não usar db reset)
-- DELETE FROM auth.users WHERE id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');

-- 3. USUÁRIOS NO AUTH.USERS
-- Nota: As senhas são 'aluno123', 'docente123', 'gestor123'
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, recovery_token, email_change_token_new, aud, role)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'lucas.santos@edu.br', crypt('aluno123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"fullname":"Lucas Santos","role":"aluno"}', now(), now(), '', '', '', 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'ana.oliveira@edu.br', crypt('docente123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"fullname":"Ana Oliveira","role":"docente"}', now(), now(), '', '', '', 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'carlos.martins@edu.br', crypt('gestor123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"fullname":"Carlos Martins","role":"gestor"}', now(), now(), '', '', '', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 4. IDENTIDADES (Necessário para o Supabase Auth reconhecer o login por e-mail)
INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', format('{"sub":"%s","email":"%s"}','00000000-0000-0000-0000-000000000001','lucas.santos@edu.br')::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000002', format('{"sub":"%s","email":"%s"}','00000000-0000-0000-0000-000000000002','ana.oliveira@edu.br')::jsonb, 'email', now(), now(), now()),
    (gen_random_uuid(), '00000000-0000-0000-0000-000000000003', format('{"sub":"%s","email":"%s"}','00000000-0000-0000-0000-000000000003','carlos.martins@edu.br')::jsonb, 'email', now(), now(), now())
ON CONFLICT (provider, identity_data) DO NOTHING;

-- 5. PROFILES (O trigger handle_new_user já deve criar, mas reforçamos aqui se necessário ou para campos extras)
-- Como o trigger já roda no INSERT de auth.users, vamos apenas atualizar os perfis com dados específicos se precisar.
UPDATE public.profiles SET studentcardid = 'MAT-2024-001', cpf = '123.456.789-00' WHERE id = '00000000-0000-0000-0000-000000000001';
UPDATE public.profiles SET cpf = '987.654.321-99' WHERE id = '00000000-0000-0000-0000-000000000002';
UPDATE public.profiles SET cpf = '000.000.000-00' WHERE id = '00000000-0000-0000-0000-000000000003';

-- 6. TURMAS (Classes)
INSERT INTO public.classes (id, name, period, subject, schedule, room, teacherid)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Desenvolvimento Web Frontend', 'Noturno', 'Programação', 'Segunda e Quarta, 19:00', 'Sala 302', '00000000-0000-0000-0000-000000000002'),
    ('c2222222-2222-2222-2222-222222222222', 'Banco de Dados Avançado', 'Matutino', 'Dados', 'Terça e Quinta, 08:00', 'Lab 04', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (id) DO NOTHING;

-- 7. MATRÍCULAS (Enrollments)
INSERT INTO public.enrollments (studentid, classid)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111'),
    ('00000000-0000-0000-0000-000000000001', 'c2222222-2222-2222-2222-222222222222')
ON CONFLICT (studentid, classid) DO NOTHING;

-- 8. NOTAS (Grades)
INSERT INTO public.grades (studentid, classid, gradevalue, av1, av2, av3, feedback, updatedby)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', 8.5, 9.0, 8.0, NULL, 'Excelente desempenho inicial.', '00000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000001', 'c2222222-2222-2222-2222-222222222222', 7.0, 7.0, NULL, NULL, 'Focar mais na normalização de dados.', '00000000-0000-0000-0000-000000000002')
ON CONFLICT (studentid, classid) DO NOTHING;

-- 9. FREQUÊNCIA (Attendance)
INSERT INTO public.attendance (studentid, classid, date, ispresent, status, updatedby)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '7 days', true, 'presente', '00000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000001', 'c1111111-1111-1111-1111-111111111111', CURRENT_DATE - INTERVAL '2 days', false, 'ausente', '00000000-0000-0000-0000-000000000002'),
    ('00000000-0000-0000-0000-000000000001', 'c2222222-2222-2222-2222-222222222222', CURRENT_DATE - INTERVAL '1 day', false, 'justificado', '00000000-0000-0000-0000-000000000002');

-- 10. FINANCEIRO (Financial Records)
INSERT INTO public.financialrecords (studentid, invoiceurl, amount, duedate, ispaid)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'https://example.com/invoice/001', 1200.00, CURRENT_DATE - INTERVAL '15 days', true),
    ('00000000-0000-0000-0000-000000000001', 'https://example.com/invoice/002', 1200.00, CURRENT_DATE + INTERVAL '15 days', false);

-- 11. MATERIAIS (Materials)
INSERT INTO public.materials (classid, title, description, contenturl, materialtype)
VALUES 
    ('c1111111-1111-1111-1111-111111111111', 'Introdução ao React', 'Slides da primeira aula sobre componentes.', 'https://example.com/materials/react-intro.pdf', 'document'),
    ('c1111111-1111-1111-1111-111111111111', 'Tailwind CSS Tips', 'Vídeo com dicas de estilização.', 'https://youtube.com/example', 'video'),
    ('c2222222-2222-2222-2222-222222222222', 'Modelagem Entidade-Relacionamento', 'Guia prático de MER.', 'https://example.com/materials/mer-guide.pdf', 'document');

-- 12. AVISOS (Announcements)
INSERT INTO public.announcements (title, content, category, priority, targetrole, authorid)
VALUES 
    ('Boas-vindas ao Semestre', 'Desejamos a todos um ótimo semestre letivo!', 'geral', 'baixa', 'todos', '00000000-0000-0000-0000-000000000003'),
    ('Manutenção do Portal', 'O portal ficará offline para manutenção no domingo.', 'sistema', 'alta', 'todos', '00000000-0000-0000-0000-000000000003'),
    ('Nova Funcionalidade: Chat', 'Agora alunos podem falar diretamente com docentes.', 'geral', 'media', 'aluno', '00000000-0000-0000-0000-000000000003');

-- 13. CHAT MESSAGES
INSERT INTO public.chat_messages (senderid, receiverid, content)
VALUES 
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Olá Professora Ana, tenho uma dúvida sobre o trabalho de React.'),
    ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Claro Lucas, pode perguntar!');
